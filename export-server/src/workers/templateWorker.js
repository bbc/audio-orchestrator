import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';
import audioWorker from './audioWorker';
import ProgressReporter from './progressReporter';

const templateSourceDir = path.dirname(require.resolve('@bbc/bbcat-orchestration-template/package.json')).replace('app.asar', 'app.asar.unpacked');

const formatContentId = sequenceId => `bbcat-orchestration:${sequenceId}`;

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
          const introSequence = sequences.find(({ isIntro }) => isIntro) || sequences[0] || {};

          return lines
            // remove unneccessary definitions (remove lines that start with any of these)
            .filter(line => [
              'const CONTENT_ID_LOOP',
              'const CONTENT_ID_MAIN',
              'const SEQUENCE_MAIN',
              'const SEQUENCE_LOOP',
            ].every(start => !line.startsWith(start)))
            // replace single line simple definitions
            .map((line) => {
              if (line.startsWith('export const INITIAL_CONTENT_ID')) {
                return `export const INITIAL_CONTENT_ID = ${JSON.stringify(formatContentId(introSequence.sequenceId))};`;
              }

              if (line.startsWith('export const JOIN_URL')) {
                return `export const JOIN_URL = ${JSON.stringify(settings.joiningLink)};`;
              }

              return line;
            })
            // return config contents as a single string again
            .join('\n');
        })
        .then((contents) => {
          // Find and replace definition of sequence URLs in config.js
          const sequenceUrls = sequences.map(({
            sequenceId,
            name,
            hold,
            skippable,
            next,
          }) => ({
            name, // for template code readability only
            contentId: formatContentId(sequenceId),
            url: `audio/${sequenceId}/sequence.json`,
            hold,
            skippable,
            next: next.map(option => ({
              contentId: formatContentId(option.sequenceId),
              label: option.label,
            })),
          }));

          // ?: non-greedy matching.
          // [\s\S] character classes of white space and non white space to include line breaks.
          return contents.replace(
            /export const SEQUENCE_URLS = \[[\s\S]*?\];/,
            `export const SEQUENCE_URLS = ${JSON.stringify(sequenceUrls, null, 2)};`,
          );
        })
        .then((contents) => {
          // Find and replace definition of zones in config.js, unless no custom zones are defined.
          if (!settings.zones || settings.zones === []) {
            return contents; // do not overwrite the template's default zones
          }

          const zones = settings.zones.map(({ name, friendlyName }) => ({ name, friendlyName }));

          // ?: non-greedy matching.
          // [\s\S] character classes of white space and non white space to include line breaks.
          return contents.replace(
            /export const ZONES = \[[\s\S]*?\];/,
            `export const ZONES = ${JSON.stringify(zones, null, 2)};`,
          );
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
