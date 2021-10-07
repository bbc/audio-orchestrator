import path from 'path';
import fse from 'fs-extra';
import mapSeries from 'async/mapSeries';
import { getLogger } from 'bbcat-orchestration-builder-logging';
import generateSequenceMetadata from './generateSequenceMetadata';
import { headerlessDashManifest, safariDashManifest } from './dashManifests';
import { segmentDuration } from '../encodingConfig';

const logger = getLogger('export-audio');

const sequenceOutputDir = (basePath, sequenceId) => path.join(basePath, `${sequenceId}`);

const copyEncodedAudioFiles = (args) => {
  const {
    sequences, settings, files, outputDir, fileStore, imageUrls, imageAltTexts,
  } = args;

  const audioOutputDir = path.join(outputDir, 'audio');

  return Promise.resolve()
    .then(() => fse.ensureDir(audioOutputDir))
    .then(() => Promise.all(sequences.map(({ sequenceId }) => {
      // Create empty output directory for the sequence
      logger.debug('about to create sequence output dir', audioOutputDir, sequenceId);
      return Promise.resolve().then(
        () => fse.emptyDir(sequenceOutputDir(audioOutputDir, sequenceId)),
      );
    })))
    .then(() => {
      // copy the files (or directory) for every item into the sequence output directory

      // make a list of tasks to run asynchronously, each is a function taking a callback
      // as its only argument.
      const tasks = [];

      // for each sequence, copy audio files and create metadata file.
      sequences.forEach((sequence) => {
        const { sequenceId, objects } = sequence;

        // for each object, copy the audio files and generate DASH manifests where needed.
        objects.forEach(({ fileId }) => {
          const { probe } = fileStore.getFile(fileId);
          const { sampleRate, numChannels } = probe;
          const { encodedItems, encodedItemsBasePath } = files[fileId];

          const sequenceDestPath = sequenceOutputDir(audioOutputDir, sequenceId);
          encodedItems.forEach(({
            relativePath, relativePathSafari,
            type,
            duration,
          }) => {
            const relativeSourcePath = path.dirname(relativePath);
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
              const paddedDuration = duration + segmentDuration(sampleRate);

              tasks.push(cb => fse.writeFile(
                path.join(sequenceDestPath, relativePath),
                headerlessDashManifest(
                  relativeSourcePath, sequenceUrl, paddedDuration, sampleRate, numChannels,
                ),
                cb,
              ));

              tasks.push(cb => fse.writeFile(
                path.join(sequenceDestPath, relativePathSafari),
                safariDashManifest(
                  relativeSourcePath, sequenceUrl, paddedDuration, sampleRate, numChannels,
                ),
                cb,
              ));
            }
          });
        });

        // Generate sequence metadata file with paths to audio files
        const sequenceMetadata = generateSequenceMetadata(
          sequence, settings, files, imageUrls, imageAltTexts,
        );
        tasks.push(cb => fse.writeFile(
          path.join(sequenceOutputDir(audioOutputDir, sequenceId), 'sequence.json'),
          JSON.stringify(sequenceMetadata, 0, 2),
          cb,
        ));
      });

      // do all the operations by calling the prepared functions, and resolve or reject the
      // promise once the mapSeries callback is called.
      return mapSeries(tasks, (fn, cb) => fn(cb));
    })
    .then(() => args);
};

export default copyEncodedAudioFiles;
