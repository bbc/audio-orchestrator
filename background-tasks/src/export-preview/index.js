import { getLogger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import runExportSteps from '../runExportSteps';
import exportDistribution from '../export-distribution';

import startPreview from './startPreview';

const logger = getLogger('export-preview');

const previewWorker = (
  args,
  onProgress = () => {},
) => {
  const steps = [
    {
      name: 'Initialising preview server...',
      fn: startPreview,
    },
    {
      name: 'Creating distribution...',
      fn: exportDistribution,
    },
  ];

  return Promise.resolve()
    .then(() => runExportSteps(steps, args, onProgress))
    .then((finalArgs) => {
      const { stopPreview, previewUrl, outputDir } = finalArgs;

      return {
        ...finalArgs,
        result: { url: previewUrl },
        onCancel: () => {
          logger.info(`Stopping server at ${previewUrl} and removing ${outputDir}.`);
          stopPreview();
          fse.remove(outputDir);
        },
      };
    });
};

export default previewWorker;
