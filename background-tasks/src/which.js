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
import { promisify } from 'util';
import { execFile as execFileCB } from 'child_process';
import { realpath as realpathCB } from 'fs';
import { getLogger } from '#logging';

const logger = getLogger('which');
const execFile = promisify(execFileCB);
const realpath = promisify(realpathCB);

// TODO macOS/Linux specific
const searchPath = [
  path.join(os.homedir(), 'audio-orchestrator-ffmpeg', 'bin'),
  path.join(os.homedir(), 'bbcat-orchestration-builder-ffmpeg', 'bin'),
  '/usr/local/bin',
  '/usr/bin',
  '/opt/homebrew/bin',
];

const results = {};

const which = (name) => {
  const allowedNames = [
    'ffmpeg',
    'ffprobe',
  ];

  if (!allowedNames.includes(name)) {
    return Promise.reject(new Error('Requested binary name is not allowed'));
  }

  if (name in results) {
    return Promise.resolve(results[name]);
  }

  const whichExec = os.platform() === 'win32' ? 'where.exe' : '/usr/bin/which';

  const whichEnv = {
    ...process.env,
  };

  // On Windows, the first (lexicographical) variant of PATH is used.
  // See: https://github.com/nodejs/node/issues/20605
  if (os.platform() === 'win32') {
    whichEnv.Path = [...searchPath, process.env.Path].join(path.delimiter);
  } else {
    whichEnv.PATH = [...searchPath, process.env.PATH].join(path.delimiter);
  }

  return execFile(whichExec, [name], { env: whichEnv })
    .then(({ stdout }) => {
      logger.silly(`${whichExec} ${name} returned ${stdout}`);

      const lines = stdout.split('\n').map(l => l.trim());
      return lines[0];
    })
    .then(execPath => realpath(execPath))
    .then((realExecPath) => {
      logger.silly(`realpath on result for ${name} returned ${realExecPath}`);
      results[name] = realExecPath;
      return realExecPath;
    })
    .catch((err) => {
      logger.error(`Could not find ${name} (running 'which ${name}' or resolving real path failed: ${err})`);
      throw new Error(`${name} not found in PATH.`);
    });
};

export const addSearchPath = (extraSearchPath) => {
  searchPath.unshift(extraSearchPath);
};

export default which;
