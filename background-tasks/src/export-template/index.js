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
import exportAudio from '../export-audio/index.js';
import runExportSteps from '../runExportSteps.js';

import copyTemplateSources from './copyTemplateSources.js';
import copyAudioFiles from './copyAudioFiles.js';
import copyImageFiles from './copyImageFiles.js';
import configureTemplateSettings from './configureTemplateSettings.js';

// const logger = getLogger('export-template');

const exportTemplate = (
  args,
  onProgress = () => {},
) => {
  const steps = [
    {
      name: 'Packaging audio...',
      fn: exportAudio,
    },
    {
      name: 'Copying template source files...',
      fn: copyTemplateSources,
    },
    {
      name: 'Copying audio files...',
      fn: copyAudioFiles,
    },
    {
      name: 'Copying image files...',
      fn: copyImageFiles,
    },
    {
      name: 'Configuring template settings...',
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
