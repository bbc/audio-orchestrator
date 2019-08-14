import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import templateWorker from './templateWorker';
import ProgressReporter from './progressReporter';

const distributionWorker = ({ sequences, settings, outputDir }, onProgress = () => {}) => {
  const progress = new ProgressReporter(3, onProgress);

  return fse.ensureDir(outputDir)
    .then(() => {
      const onTemplateProgress = progress.advance('packaging audio and generating template source code');
      return templateWorker({ sequences, settings, outputDir }, onTemplateProgress);
    })
    .then(() => {
      progress.advance('removing temporary files');
      return fse.readdir(outputDir)
        .then(files => files.filter(name => name !== 'dist'))
        .then(files => Promise.all(files.map(file => fse.remove(path.join(outputDir, file)))));
    })
    .then(() => {
      progress.complete();
      return { result: true }; // TODO, have to return a { result } but there isn't really a value
    })
    .catch((err) => {
      logger.info(err);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default distributionWorker;
