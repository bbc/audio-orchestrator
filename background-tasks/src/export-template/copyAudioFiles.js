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

const copyAudioFiles = (args) => {
  const { outputDir, settings } = args;

  // Because there is no webpack build process anymore, copy the audio files into dist/ here,
  // and remove the default audio files that came with the template.
  const outputDistAudioDir = path.join(outputDir, 'dist', 'audio');
  return fse.readdir(outputDistAudioDir)
    .then((files) => {
      // Delete audio files shipped with the template from dist/audio, except if they are needed
      // for the calibration option (and that option is enabled)
      const filesToDelete = settings.enableCalibration
        ? files.filter(file => path.basename(file) !== 'calibration')
        : files;
      return mapSeries(
        filesToDelete,
        (name, cb) => {
          fse.remove(path.join(outputDistAudioDir, name))
            .then(result => cb(null, result))
            .catch(err => cb(err));
        },
      );
    })
    .then(() => fse.copy(
      path.join(outputDir, 'audio'),
      path.join(outputDir, 'dist', 'audio'),
    ))
    .then(() => args);
};

export default copyAudioFiles;
