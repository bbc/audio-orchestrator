import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { execFile as execFileCB } from 'child_process';
import { realpath as realpathCB } from 'fs';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('which');
const execFile = promisify(execFileCB);
const realpath = promisify(realpathCB);

// TODO macOS/Linux specific
const searchPath = [
  path.join(os.homedir(), 'audio-orchestrator-ffmpeg', 'bin'),
  path.join(os.homedir(), 'bbcat-orchestration-builder-ffmpeg', 'bin'),
  process.env.PATH,
  '/usr/local/bin',
  '/usr/bin',
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

  return execFile('/usr/bin/which', [name], {
    env: {
      ...process.env,
      PATH: searchPath.join(':'),
    },
  })
    .then(({ stdout }) => {
      logger.silly(`which ${name} returned ${stdout}`);
      return stdout.trim();
    })
    .then(execPath => realpath(execPath))
    .then((realExecPath) => {
      logger.silly(`realpath on which result for ${name} returned ${realExecPath}`);
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
