// import { getLogger } from 'bbcat-orchestration-builder-logging';
import runExportSteps from '../runExportSteps';

import checkSequencesAreValid from './checkSequencesAreValid';
import waitForEncoding from './waitForEncoding';
import copyEncodedAudioFiles from './copyEncodedAudioFiles';

// const logger = getLogger('export-audio');

const exportAudio = (
  args,
  onProgress = () => {},
) => {
  const steps = [
    {
      name: 'checking sequence metadata',
      fn: checkSequencesAreValid,
    },
    {
      name: 'waiting for audio analysis and encoding to finish',
      fn: waitForEncoding,
    },
    {
      name: 'copying encoded audio files and writing metadata',
      fn: copyEncodedAudioFiles,
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

export default exportAudio;
