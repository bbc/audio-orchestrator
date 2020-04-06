import path from 'path';
import os from 'os';
import { promisify } from 'util';
import { exec as execCB } from 'child_process';
import { realpath as realpathCB } from 'fs';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('which');
const exec = promisify(execCB);
const realpath = promisify(realpathCB);

// TODO macOS/Linux specific
const searchPath = [
  path.join(os.homedir(), 'bbcat-orchestration-builder-ffmpeg', 'bin'),
  process.env.PATH,
  '/usr/bin',
  '/usr/local/bin',
].join(':');

const results = {};

const which = (name) => {
  if (name in results) {
    return Promise.resolve(results[name]);
  }

  return exec(`which ${name}`, {
    env: {
      ...process.env,
      PATH: searchPath,
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

export default which;
