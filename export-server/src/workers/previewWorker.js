import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import startPreview from './previewServer';
import distributionWorker from './distributionWorker';
import ProgressReporter from './progressReporter';

const previewWorker = ({ sequences, settings, outputDir }, onProgress = () => {}) => {
  const progress = new ProgressReporter(2, onProgress);

  const distDir = path.join(outputDir, 'dist');

  return fse.ensureDir(distDir)
    .then(() => {
      progress.advance('initialising preview server'); // 0

      // start the server first because its chosen port number is needed to for the joiningLink.
      return startPreview(distDir);
    })
    .then(({ stop, url }) => {
      const onDistributionProgress = progress.advance('building application'); // 1

      return distributionWorker({
        sequences,
        settings: {
          ...settings,
          joiningLink: `${url}#!/join`,
          baseUrl: `${url}/audio`,
        },
        outputDir,
      }, onDistributionProgress)
        .then(() => ({ stop, url }));
    })
    .then(({ stop, url }) => {
      progress.complete();
      return { result: true, url, stopPreview: stop };
    })
    .catch((err) => {
      logger.warn(err);

      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default previewWorker;
