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
import path from 'path';
import mapSeries from 'async/mapSeries.js';
import { fileURLToPath } from 'url';
import { getLogger } from '#logging';

const logger = getLogger('export-template');

const defaultTemplateSourceDir = path.dirname(fileURLToPath(import.meta.resolve('@bbc/audio-orchestration-template/package.json')))
  .replace('app.asar', 'app.asar.unpacked');

const copyTemplateSources = (args) => {
  const { outputDir, settings = {} } = args;
  const { customTemplatePath } = settings;

  const templateSourceDir = customTemplatePath || defaultTemplateSourceDir;

  logger.debug(`copying template source files from ${templateSourceDir} to ${outputDir}`);

  return fse.readdir(templateSourceDir)
    .then((files) => {
      // copy all files that are not audio files or node_modules
      // TODO: keep the calibration audio files (audio/calibration) for template code export.
      const filesToCopy = files.filter(file => !([
        'node_modules',
        'audio',
      ].includes(path.basename(file))));

      if (!filesToCopy.map(file => path.basename(file)).includes('dist')) {
        logger.error(`no 'dist' directory in template path ${templateSourceDir}`);
        throw new Error('Template source directory does not include expected \'dist\' directory, so cannot be used.');
      }

      return mapSeries(
        filesToCopy,
        (name, cb) => {
          const src = path.join(templateSourceDir, name);
          const dest = path.join(outputDir, name);
          fse.copy(src, dest).then(result => cb(null, result)).catch(err => cb(err));
        },
      );
    })
    .then(() => args);
};

export default copyTemplateSources;
