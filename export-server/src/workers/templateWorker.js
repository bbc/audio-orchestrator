import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';
import audioWorker from './audioWorker';
import ProgressReporter from './progressReporter';

const templateSourceDir = path.dirname(require.resolve('@bbc/bbcat-orchestration-template/package.json')).replace('app.asar', 'app.asar.unpacked');

const templateWorker = ({ sequences, settings, outputDir }, onProgress = () => {}) => {
  const progress = new ProgressReporter(3, onProgress);

  return fse.ensureDir(outputDir)
    .then(() => {
      const onAudioProgress = progress.advance('packaging audio');
      return audioWorker({ sequences, outputDir }, onAudioProgress);
    })
    .then(() => {
      progress.advance('copying template source files');
      logger.debug(`copying template source files from ${templateSourceDir} to ${outputDir}`);
      return fse.readdir(templateSourceDir)
        .then((files) => {
          const filesToCopy = files.filter(file => path.basename(file) !== 'node_modules');

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
      progress.advance('configuring template contents');
      const configPath = path.join(outputDir, 'src', 'config.js');
      logger.debug(`reading config from ${configPath}`);

      return fse.readFile(configPath, { encoding: 'utf8' })
        .then((contents) => {
          const lines = contents.split('\n');
          const loopSequence = sequences.find(({ isIntro }) => isIntro) || sequences[0] || {};
          const mainSequence = sequences.find(({ isMain }) => isMain) || sequences[0] || {};

          return lines.map((line) => {
            // TODO: implement more flexible sequence specification in template and adjust here.
            if (line.startsWith('const SEQUENCE_LOOP')) {
              return `const SEQUENCE_LOOP = 'audio/${loopSequence.sequenceId}/sequence.json';`;
            }

            if (line.startsWith('const SEQUENCE_MAIN')) {
              return `const SEQUENCE_MAIN = 'audio/${mainSequence.sequenceId}/sequence.json';`;
            }

            if (line.startsWith('export const JOIN_URL')) {
              return `export const JOIN_URL = '${settings.joiningLink}';`;
            }

            return line;
          }).join('\n');
        })
        .then(updatedContents => fse.writeFile(configPath, updatedContents));
    })
    .then(() => {
      progress.complete();
      return { result: true }; // TODO, have to return a { result } but there isn't really a value
    })
    .catch((err) => {
      logger.debug(`removing outputDir ${outputDir} after error in templateWorker.`);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default templateWorker;
