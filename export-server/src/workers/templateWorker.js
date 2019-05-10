import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';

import audioWorker from './audioWorker';

// TODO replace with path into electron app bundle.
const templateSourceDir = path.dirname(require.resolve('@bbc/bbcat-orchestration-template/package.json'));

const templateWorker = ({ sequences, settings, outputDir }, onProgress = () => {}) => {
  const total = 3;
  let completed = 0;

  const nextStep = (currentStep) => {
    onProgress({ completed, total, currentStep });
    completed += 1;
  };

  const audioOutputDir = path.join(outputDir, 'audio');

  return fse.ensureDir(outputDir)
    .then(() => {
      nextStep('packaging audio');
      return audioWorker({ sequences, outputDir: audioOutputDir }, () => {});
    })
    .then(() => {
      nextStep('copying template source files');
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
      nextStep('configuring template contents');
      const configPath = path.join(outputDir, 'src', 'config.js');
      console.log('reading', configPath);

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
      nextStep('finished'); // to ensure completed === total
      return { result: true }; // TODO, have to return a { result } but there isn't really a value
    })
    .catch((err) => {
      console.log(err);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default templateWorker;
