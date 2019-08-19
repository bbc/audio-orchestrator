import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import startPreview from './previewServer';
import distributionWorker from '../export-distribution';
import ProgressReporter from '../progressReporter';
import getOutputDir from '../getOutputDir';

const previewWorker = (
  { sequences, settings },
  fileStore,
  onProgress = () => {},
  exportOutputDir,
) => {
  const progress = new ProgressReporter(2, onProgress);

  logger.debug('previewWorker');

  let distDir;
  let outputDir;
  return getOutputDir(exportOutputDir)
    .then((d) => {
      logger.debug(`exportPreview outputDir = ${d}`);
      outputDir = d;
      distDir = path.join(d, 'dist');
    })
    .then(() => fse.ensureDir(distDir))
    .then(() => {
      progress.advance('initialising preview server'); // 0

      // start the server first because its chosen port number is needed to for the joiningLink.
      return startPreview(distDir);
    })
    .then(({ stop, url }) => {
      const onDistributionProgress = progress.advance('building application'); // 1

      return distributionWorker(
        {
          sequences,
          settings: {
            ...settings,
            joiningLink: `${url}#!/join`,
            baseUrl: `${url}/audio`,
          },
        },
        fileStore,
        onDistributionProgress,
        outputDir,
      ).then(() => ({ stop, url }));
    })
    .then(({ stop, url }) => {
      progress.complete();
      return {
        result: { url },
        onCancel: () => {
          logger.info(`Stopping server at ${url} and removing ${outputDir}.`);
          stop();
          fse.remove(outputDir);
        },
      };
    })
    .catch((err) => {
      logger.warn(err);

      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default previewWorker;
