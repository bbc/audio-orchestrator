// import { getLogger } from 'bbcat-orchestration-builder-logging';
import runExportSteps from '../runExportSteps';
import exportTemplate from '../export-template';

import removeUnusedTemplateFiles from './removeUnusedTemplateFiles';

// const logger = getLogger('export-distribution');

const distributionWorker = (
  args,
  onProgress = () => {},
) => {
  const steps = [
    {
      name: 'packaging audio and generating template source code',
      fn: exportTemplate,
    },
    {
      name: 'removing temporary files',
      fn: removeUnusedTemplateFiles,
    },
  ];

  return Promise.resolve()
    .then(() => runExportSteps(steps, args, onProgress))
    .then((finalArgs) => {
      const { outputDir } = finalArgs;

      return {
        ...finalArgs,
        result: { outputDir },
      };
    });
};

export default distributionWorker;
