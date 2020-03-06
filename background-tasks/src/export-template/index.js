// import { getLogger } from 'bbcat-orchestration-builder-logging';
import exportAudio from '../export-audio';
import runExportSteps from '../runExportSteps';

import copyTemplateSources from './copyTemplateSources';
import copyAudioFiles from './copyAudioFiles';
import copyImageFiles from './copyImageFiles';
import configureTemplateSettings from './configureTemplateSettings';

// const logger = getLogger('export-template');

const exportTemplate = (
  args,
  onProgress = () => {},
) => {
  const steps = [
    {
      name: 'packaging audio',
      fn: exportAudio,
    },
    {
      name: 'copying template source files',
      fn: copyTemplateSources,
    },
    {
      name: 'copying audio files',
      fn: copyAudioFiles,
    },
    {
      name: 'copying image files',
      fn: copyImageFiles,
    },
    {
      name: 'configuring template settings',
      fn: configureTemplateSettings,
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

export default exportTemplate;
