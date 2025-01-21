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

import path from 'path';
import os from 'os';
import fse from 'fs-extra';
import { getLogger } from '#logging';

const logger = getLogger('withOutputDir');

const withOutputDir = (payload, args = {}) => {
  let { outputDir } = args;

  return Promise.resolve()
    // If outputDir is given, ensure it exists and return original args.
    // Otherwise, create a new temporary directory and inject the outputDir property into args.
    .then(() => {
      if (args.outputDir) {
        return fse.ensureDir(args.outputDir)
          .then(() => args);
      }

      return fse.mkdtemp(path.join(os.tmpdir(), 'bbcat-orchestration-'))
        .then((d) => {
          outputDir = d;
          return { ...args, outputDir };
        });
    })
    // Run the payload function with the args now guaranteed to include an outputDir
    .then(argsWithOutputDir => payload(argsWithOutputDir))
    .catch((err) => {
      logger.warn(`removing outputDir ${outputDir} after error in payload function.`);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default withOutputDir;
