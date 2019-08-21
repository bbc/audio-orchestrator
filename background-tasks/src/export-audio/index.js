import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';
import ProgressReporter from '../progressReporter';
import getOutputDir from '../getOutputDir';
import generateSequenceMetadata from './generateSequenceMetadata';
import { headerlessDashManifest, safariDashManifest } from './dashManifests';
import { SILENCE_DURATION } from '../encodingConfig';

const sequenceOutputDir = (basePath, sequenceId) => path.join(basePath, `${sequenceId}`);

const audioWorker = (
  { sequences, settings },
  fileStore,
  onProgress = () => {},
  exportOutputDir,
) => {
  const progress = new ProgressReporter(5, onProgress);

  const files = {};
  let outputDir;
  let audioOutputDir;

  return getOutputDir(exportOutputDir)
    .then((d) => {
      outputDir = d;
      audioOutputDir = path.join(d, 'audio');
    })
    .then(() => fse.ensureDir(audioOutputDir))
    .then(() => {
      // Ensure each sequence has at least one object (the client decides which sequences to put
      // forward if some are optional).
      progress.advance('checking that sequence metadata has been added');

      sequences.forEach((sequence) => {
        if (!sequence.objects || sequence.objects.length === 0) {
          throw new Error('Not all sequences have objects.');
        }
      });
    })
    .then(() => {
      // Ensure all objects have an assigned fileId, by iterating over the objects in each sequence
      progress.advance('checking that all objects have an audio file');

      sequences.forEach((sequence) => {
        sequence.objects.forEach((object) => {
          if (!object.fileId) {
            throw new Error('Not all objects have an audio file.');
          }
        });
      });
    })
    .then(() => {
      // Ensure each file has encodedItems set, and the encodedItems.baseDir exists.
      const onEncodeProgress = progress.advance('waiting for audio analysis and encoding to finish');


      // Find the fileIds to be encoded and store a reference to their AudioFile object so we can
      // later get their probe and encodedItems details for creating the sequence metadata.
      const requiredFiles = [];
      sequences.forEach(({ objects }) => {
        objects.forEach(({ fileId }) => {
          files[fileId] = fileStore.getFile(fileId);
          requiredFiles.push({ fileId });
        });
      });

      return fileStore.encodeFiles(requiredFiles, onEncodeProgress)
        .then(({ result }) => {
          const filesWithErrors = result.filter(r => r.success === false);
          if (filesWithErrors.length > 0) {
            throw new Error(`${filesWithErrors.length} audio files could not be encoded. (Error on first file was: ${filesWithErrors[0].error})`);
          }
        });
    })
    .then(() => {
      progress.advance('copying encoded audio files');

      return Promise.all(sequences.map(({ sequenceId }) => {
        // Create empty output directory for the sequence
        logger.debug('about to create sequence output dir', audioOutputDir, sequenceId);
        return fse.emptyDir(sequenceOutputDir(audioOutputDir, sequenceId));
      }))
        .then(() => {
          // copy the files (or directory) for every item into the sequence output directory

          // make a list of tasks to run asynchronously, each is a function taking a callback
          // as its only argument.
          const tasks = [];

          sequences.forEach(({ sequenceId, objects }) => {
            objects.forEach(({ fileId }) => {
              const { encodedItems, encodedItemsBasePath } = files[fileId];

              const sequenceDestPath = sequenceOutputDir(audioOutputDir, sequenceId);
              encodedItems.forEach(({
                relativePath, relativePathSafari,
                type,
                duration,
              }) => {
                const relativeSourcePath = relativePath.replace(/\/manifest.mpd/, '');
                const sourcePath = path.join(encodedItemsBasePath, relativeSourcePath);
                const destPath = path.join(sequenceDestPath, relativeSourcePath);

                // Copy all the files for this item
                tasks.push(cb => fse.copy(
                  sourcePath,
                  destPath,
                  { overwrite: false, errorOnExist: false },
                  cb,
                ));

                // if it is a DASH stream item, overwrite the manifests
                if (type === 'dash') {
                  const { baseUrl } = settings;
                  const sequenceUrl = `${baseUrl}/${sequenceId}`;
                  const paddedDuration = duration + SILENCE_DURATION;

                  tasks.push(cb => fse.writeFile(
                    path.join(sequenceDestPath, relativePath),
                    headerlessDashManifest(relativeSourcePath, sequenceUrl, paddedDuration),
                    cb,
                  ));

                  tasks.push(cb => fse.writeFile(
                    path.join(sequenceDestPath, relativePathSafari),
                    safariDashManifest(relativeSourcePath, sequenceUrl, paddedDuration),
                    cb,
                  ));
                }
              });
            });
          });

          // do the copy operations by calling the prepared functions, and resolve or reject the
          // promise once the mapSeries callback is called.
          return mapSeries(tasks, (fn, cb) => fn(cb));
        });
    })
    .then(() => {
      progress.advance('generating metadata files');
      return mapSeries(sequences, (sequence, callback) => {
        const { sequenceId } = sequence;
        const sequenceMetadata = generateSequenceMetadata(sequence, settings, files);

        fse.writeFile(
          path.join(sequenceOutputDir(audioOutputDir, sequenceId), 'sequence.json'),
          JSON.stringify(sequenceMetadata, 0, 2),
          callback,
        );
      });
    })
    .then(() => {
      progress.complete();
      return {
        result: { outputDir },
      };
    });
};

export default audioWorker;
