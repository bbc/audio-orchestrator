import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('export-template');

const templateSourceDir = path.dirname(require.resolve('@bbc/bbcat-orchestration-template/package.json')).replace('app.asar', 'app.asar.unpacked');

const copyTemplateSources = (args) => {
  const { outputDir } = args;

  logger.debug(`copying template source files from ${templateSourceDir} to ${outputDir}`);

  return fse.readdir(templateSourceDir)
    .then((files) => {
      // copy all files that are not audio files or node_modules
      const filesToCopy = files.filter(file => !([
        'node_modules',
        'audio',
      ].includes(path.basename(file))));

      return mapSeries(
        filesToCopy,
        (name, cb) => {
          const src = path.join(templateSourceDir, name);
          const dest = path.join(outputDir, name);
          fse.copy(src, dest).then(result => cb(null, result)).catch(err => cb(err));
        },
      );
    })
    .then(() => args);
};

export default copyTemplateSources;
