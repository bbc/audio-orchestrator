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

/**
 * Copies image files from images/ to dist/images
 */
const copyImageFiles = (args) => {
  const { outputDir } = args;

  return fse.copy(
    path.join(outputDir, 'images'),
    path.join(outputDir, 'dist', 'images'),
  )
    .then(() => args);
};

export default copyImageFiles;
