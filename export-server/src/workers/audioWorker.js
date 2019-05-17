import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';
import ProgressReporter from './progressReporter';

class AudioWorkerValidationError extends Error {
  constructor(message, missingEncodedItems = null) {
    super(message);
    this.missingEncodedItems = missingEncodedItems;
  }
}

const sequenceOutputDir = (basePath, sequenceId) => path.join(basePath, `${sequenceId}`);

/**
 * Finds the duration of the sequence from that of the longest file referenced by an object.
 *
 * @returns {number}
 */
const findSequenceDuration = (objects, files) => {
  let duration = 0;

  objects.forEach(({ fileId }) => {
    const file = files[fileId];
    duration = Math.max(duration, file.probe.duration);
  });

  return duration;
};

const audioWorker = ({ sequences, outputDir }, onProgress = () => {}) => {
  const progress = new ProgressReporter(6, onProgress);

  const audioOutputDir = path.join(outputDir, 'audio');

  return fse.ensureDir(audioOutputDir)
    .then(() => {
      // Ensure each sequence has at least one object (the client decides which sequences to put
      // forward if some are optional).
      progress.advance('checking that sequence metadata has been added');

      sequences.forEach((sequence) => {
        if (!sequence.objects || sequence.objects.length === 0) {
          throw new AudioWorkerValidationError('Not all sequences have objects.');
        }
      });
    })
    .then(() => {
      // Ensure all objects have an assigned fileId, by iterating over the objects in each sequence
      progress.advance('checking that all objects are associated to a an audio file');

      sequences.forEach((sequence) => {
        sequence.objects.forEach((object) => {
          if (!object.fileId) {
            throw new AudioWorkerValidationError('Not all objects have files assigned.');
          }
        });
      });
    })
    .then(() => {
      // Ensure each file has encodedItems set, and the encodedItems.baseDir exists.
      progress.advance('checking that all audio files have been encoded');

      const missingEncodedItems = [];
      const encodedItemsToCheck = [];

      sequences.forEach(({ objects, files, sequenceId }) => {
        // generate a list of file objects including fileId for all files used by an object
        const requiredFiles = objects.map(({ fileId }) => ({
          fileId,
          ...files[fileId],
        }));

        // Add an entry for each file into one of two lists, for those never encoded, and those
        // where the encoded files should be checked.
        requiredFiles.forEach(({ fileId, encodedItems, encodedItemsBasePath }) => {
          if (!encodedItems) {
            missingEncodedItems.push({ sequenceId, fileId });
          } else {
            encodedItemsToCheck.push({
              sequenceId,
              fileId,
              encodedItems,
              encodedItemsBasePath,
            });
          }
        });
      });

      if (missingEncodedItems.length > 0) {
        throw new AudioWorkerValidationError(
          'Not all required audio files have been encoded.',
          { missingEncodedItems },
        );
      }

      return encodedItemsToCheck;
    })
    .then((encodedItemsToCheck) => {
      progress.advance('checking that all encoded audio files are available');

      const missingEncodedItems = [];

      return new Promise((resolve, reject) => {
        mapSeries(encodedItemsToCheck, ({ sequenceId, fileId, encodedItemsBasePath }, callback) => {
          fse.stat(encodedItemsBasePath)
            .then(() => {
              // baseDir exists
              callback();
            })
            .catch(() => {
              // baseDir is not accessible
              missingEncodedItems.push({ sequenceId, fileId });
              callback();
            });
        }, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve({ result });
          }
        });
      }).then(() => {
        if (missingEncodedItems.length > 0) {
          throw new AudioWorkerValidationError(
            'Not all encoded audio files are available',
            missingEncodedItems,
          );
        }

        return encodedItemsToCheck;
      });
    })
    .then((requiredEncodedItems) => {
      progress.advance('copying encoded audio files');

      return Promise.all(sequences.map(({ sequenceId }) => {
        // Create empty output directory for the sequence
        logger.debug('about to create sequence output dir', audioOutputDir, sequenceId);
        return fse.emptyDir(sequenceOutputDir(audioOutputDir, sequenceId));
      }))
        .then(() => new Promise((resolve, reject) => {
          // copy the files (or directory) for every item into the sequence output directory

          // make a list of copy tasks to run in parallel
          const copyTasks = requiredEncodedItems.map(({ sequenceId, encodedItemsBasePath }) => {
            // the returned value is a function taking the async callback
            return cb => fse.copy(
              encodedItemsBasePath,
              sequenceOutputDir(audioOutputDir, sequenceId),
              { overwrite: false, errorOnExist: false },
              cb,
            );
          });

          // do the copy operations by calling the prepared functions, and resolve or reject the
          // promise once the mapSeries callback is called.
          mapSeries(copyTasks, (fn, cb) => fn(cb), (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        }));
    })
    .then(() => {
      progress.advance('generating metadata files');
      return new Promise((resolve, reject) => {
        logger.debug('generating metadata files (mapSeries)');
        mapSeries(sequences, (sequence, callback) => {
          const {
            sequenceId,
            loop,
            objects,
            files,
          } = sequence;

          const duration = findSequenceDuration(objects, files);

          const sequenceMetadata = {
            duration,
            loop,
            outPoints: [],
            objects: objects.map(object => ({
              objectId: `${object.objectNumber}-${object.label}`,
              orchestration: {
                ...object.orchestration,
              },
              items: files[object.fileId].encodedItems.map(item => ({
                start: item.start,
                duration: item.duration,
                source: {
                  channelMapping: object.channelMapping,
                  type: item.type,
                  url: `audio/${sequenceId}/${item.relativePath}`,
                  urlSafari: item.relativePathSafari ? `audio/${sequenceId}/${item.relativePathSafari}` : null,
                },
              })),
            })),
          };

          fse.writeFile(
            path.join(sequenceOutputDir(audioOutputDir, sequenceId), 'sequence.json'),
            JSON.stringify(sequenceMetadata, 0, 2),
            callback,
          );
        }, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    })
    .then((result) => {
      progress.complete();
      return { result };
    });
};

export default audioWorker;
