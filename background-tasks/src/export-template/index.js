import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';
import audioWorker from '../export-audio';
import ProgressReporter from '../progressReporter';
import getOutputDir from '../getOutputDir';
import templateConfiguration from './templateConfiguration';

const templateSourceDir = path.dirname(require.resolve('@bbc/bbcat-orchestration-template/package.json')).replace('app.asar', 'app.asar.unpacked');

const templateWorker = (
  { sequences, settings },
  fileStore,
  onProgress = () => {},
  exportOutputDir,
) => {
  const progress = new ProgressReporter(6, onProgress);

  let outputDir;
  return getOutputDir(exportOutputDir)
    .then((d) => { outputDir = d; })
    .then(() => fse.ensureDir(outputDir))
    .then(() => {
      const onAudioProgress = progress.advance('packaging audio');
      return audioWorker({ sequences, settings }, fileStore, onAudioProgress, outputDir);
    })
    .then(() => {
      progress.advance('copying template source files');
      logger.debug(`copying template source files from ${templateSourceDir} to ${outputDir}`);
      return fse.readdir(templateSourceDir)
        .then((files) => {
          // copy all files that are not audio files or node_modules
          const filesToCopy = files.filter(file => !([
            'node_modules',
            'audio',
          ].includes(path.basename(file))));

          return new Promise((resolve, reject) => {
            mapSeries(
              filesToCopy,
              (name, cb) => {
                const src = path.join(templateSourceDir, name);
                const dest = path.join(outputDir, name);
                fse.copy(src, dest).then(result => cb(null, result)).catch(err => cb(err));
              },
              (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              },
            );
          });
        });
    })
    .then(() => {
      progress.advance('copying audio files');
      // Because there is no webpack build process anymore, copy the audio files into dist/ here,
      // and remove the default audio files that came with the template.
      return fse.remove(path.join(outputDir, 'dist', 'audio'))
        .then(() => fse.copy(
          path.join(outputDir, 'audio'),
          path.join(outputDir, 'dist', 'audio'),
        ));
    })
    .then(() => {
      progress.advance('configuring template settings');

      // Generate the configuration JSON string to put in
      const configuration = templateConfiguration(sequences, settings);

      // There are two versions of index.html, currently both are the same. Both contain a script
      // tag that sets the configuration and initialises the template.
      const configPaths = [
        path.join(outputDir, 'src', 'presentation', 'index.html'),
        path.join(outputDir, 'dist', 'index.html'),
      ];

      return Promise.all(
        configPaths.map(configPath => fse.readFile(configPath, { encoding: 'utf8' })
          // Replace the configuration in both config files using a regular expression:
          // ?: non-greedy matching.
          // [\s\S] character classes of white space and non white space to include line breaks.
          .then(contents => contents.replace(
            /const config = \{[\s\S]*?\};/,
            `const config = ${configuration};`,
          ))
          // Remove other variable definitions (TODO just remove them from template)
          .then(contents => contents.replace(
            /const [A-Z_]+ = '.*';/g,
            '',
          ))
          .then(updatedContents => fse.writeFile(configPath, updatedContents))),
      );
    })
    .then(() => {
      progress.complete();
      return {
        result: { outputDir },
      };
    })
    .catch((err) => {
      logger.debug(`removing outputDir ${outputDir} after error in templateWorker.`);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default templateWorker;
