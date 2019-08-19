import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import getOutputDir from '../getOutputDir';
import templateWorker from '../export-template';
import ProgressReporter from '../progressReporter';

const distributionWorker = (
  { sequences, settings },
  fileStore,
  onProgress = () => {},
  exportOutputDir,
) => {
  const progress = new ProgressReporter(3, onProgress);

  let outputDir;
  return getOutputDir(exportOutputDir)
    .then((d) => { outputDir = d; })
    .then(() => fse.ensureDir(outputDir))
    .then(() => {
      const onTemplateProgress = progress.advance('packaging audio and generating template source code');
      return templateWorker({ sequences, settings }, fileStore, onTemplateProgress, outputDir);
    })
    .then(() => {
      progress.advance('removing temporary files');
      return fse.readdir(outputDir)
        .then(files => files.filter(name => name !== 'dist'))
        .then(files => Promise.all(files.map(file => fse.remove(path.join(outputDir, file)))));
    })
    .then(() => {
      progress.complete();
      return {
        result: { outputDir },
      };
    })
    .catch((err) => {
      logger.info(err);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default distributionWorker;
