import { promisify } from 'util';
import { execFile as execFileCB } from 'child_process';

import which from '../which';

const execFile = promisify(execFileCB);

const checkFfmpeg = () => which('ffmpeg')
  .then(path => execFile(path, ['-version']))
  .then(({ stdout }) => {
    if (!stdout.includes('ffmpeg version')) {
      throw new Error('ffmpeg was found but does not appear to work (ffmpeg -version does not output in expected format).');
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
