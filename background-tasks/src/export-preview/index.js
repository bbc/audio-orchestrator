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
*/

import fse from 'fs-extra';
import { getLogger } from '#logging';
import runExportSteps from '../runExportSteps.js';
import exportDistribution from '../export-distribution/index.js';

import startPreview from './startPreview.js';

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
