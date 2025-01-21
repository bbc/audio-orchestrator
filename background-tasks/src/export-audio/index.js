/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/// import { getLogger } from '#logging';
import runExportSteps from '../runExportSteps.js';

import checkSequencesAreValid from './checkSequencesAreValid.js';
import waitForEncoding from './waitForEncoding.js';
import collectImageFiles from './collectImageFiles.js';
import copyEncodedAudioFiles from './copyEncodedAudioFiles.js';

// const logger = getLogger('export-audio');

const exportAudio = (
  args,
  onProgress = () => {},
) => {
  const steps = [
    {
      name: 'Checking sequence metadata...',
      fn: checkSequencesAreValid,
    },
    {
      name: 'Waiting for audio analysis and encoding to finish...',
      fn: waitForEncoding,
    },
    {
      name: 'Collecting image files...',
      fn: collectImageFiles,
    },
    {
      name: 'Copying encoded audio files and writing metadata...',
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
