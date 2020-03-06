import { promisify } from 'util';
import { execFile as execFileCB } from 'child_process';
import semverCompare from 'semver-compare';

import which from '../which';

const MIN_FFMPEG_VERSION = '4.1.0';

const execFile = promisify(execFileCB);

const checkFfmpeg = () => which('ffmpeg')
  .then(path => execFile(path, ['-version']))
  .then(({ stdout }) => {
    const matches = stdout.match(/ffmpeg version ([0-9.]*)/);

    if (!matches || matches.length < 2) {
      throw new Error('ffmpeg was found but does not appear to work (ffmpeg -version does not output in expected format).');
    }

    const version = matches[1];

    if (semverCompare(MIN_FFMPEG_VERSION, version) > 0) {
      return {
        success: false,
        name: 'ffmpeg',
        error: `ffmpeg version must be at least ${MIN_FFMPEG_VERSION}.`,
      };
    }

    return {
      success: true,
      name: 'ffmpeg',
    };
  })
  .catch(e => ({
    success: false,
    name: 'ffmpeg',
    error: `Could not execute ffmpeg (${e}).`,
  }));

const checkFfprobe = () => which('ffprobe')
  .then(path => execFile(path, ['-version']))
  .then(({ stdout }) => {
    if (!stdout.includes('ffprobe version')) {
      throw new Error('ffprobe was found but does not appear to work (ffprobe -version does not output in expected format).');
    }
    return {
      success: true,
      name: 'ffprobe',
    };
  })
  .catch(e => ({
    success: false,
    name: 'ffprobe',
    error: `Could not execute ffprobe (${e}).`,
  }));

// summarise results
const checkRequirements = () => Promise.all([
  checkFfmpeg(),
  checkFfprobe(),
]).then(results => ({
  result: {
    success: results.every(r => r.success),
    results,
  },
}));

export default checkRequirements;
