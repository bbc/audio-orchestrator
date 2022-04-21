import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('export-template');

const defaultTemplateSourceDir = path.dirname(require.resolve('@bbc/audio-orchestration-template/package.json'))
  .replace('app.asar', 'app.asar.unpacked');

const copyTemplateSources = (args) => {
  const { outputDir, settings = {} } = args;
  const { customTemplatePath } = settings;

  const templateSourceDir = customTemplatePath || defaultTemplateSourceDir;

  logger.debug(`copying template source files from ${templateSourceDir} to ${outputDir}`);

  return fse.readdir(templateSourceDir)
    .then((files) => {
      // copy all files that are not audio files or node_modules
      // TODO: keep the calibration audio files (audio/calibration) for template code export.
      const filesToCopy = files.filter(file => !([
        'node_modules',
        'audio',
      ].includes(path.basename(file))));

      if (!filesToCopy.map(file => path.basename(file)).includes('dist')) {
        logger.error(`no 'dist' directory in template path ${templateSourceDir}`);
        throw new Error('Template source directory does not include expected \'dist\' directory, so cannot be used.');
      }

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
