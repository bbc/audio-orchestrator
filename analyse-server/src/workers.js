import { promisify } from 'util';
import { spawn } from 'child_process';
import fs from 'fs';
import { path as ffprobePath } from 'ffprobe-static';
import { path as ffmpegPath } from 'ffmpeg-static';
import ffprobeCB from 'node-ffprobe';

// configure the ffprobe module with the path to the bundled ffprobe
ffprobeCB.FFPROBE_PATH = ffprobePath;

// wrap callback-based methods in a promise API:
const stat = promisify(fs.stat);
const ffprobe = promisify(ffprobeCB);

/**
 * Check whether the file exists on the file system.
 *
 * @returns {Promise}
 */
export const processExists = filePath => stat(filePath)
  .then(() => ({ exists: true }));

/**
 * Run ffprobe on the file and verify that the first stream is an audio stream.
 *
 * @returns {Promise}
 */
export const processProbe = filePath => ffprobe(filePath)
  .then((data) => {
    // ensure there is at least one stream detected in the file and return the first one
    if (!data.streams || data.streams.length === 0) {
      throw new Error('No media streams in file');
    }
    return data.streams[0];
  })
  .then((stream) => {
    // ensure the stream is an audio stream before accessing its properties
    if (stream.codec_type !== 'audio') {
      throw new Error('First stream in file does not contain an audio codec');
    }
    /* eslint-disable-next-line camelcase */
    const { sample_rate, channels, duration } = stream;

    const probe = {
      sampleRate: sample_rate,
      numChannels: channels,
      duration,
    };

    return { probe };
  });

/**
 * Run ffmpeg on the file with a null target to detect silent sections in the audio content.
 *
 * @returns {Promise}
 */
export const processSilence = (filePath) => {
  // ffmpeg arguments
  const ffmpegArgs = [
    '-i', filePath, // input file path
    '-af', 'silencedetect=n=-80dB:d=0.1', // silence detect noise floor and minimum silence length
    '-f', 'null', // no output
    '-', // output to stdout
  ];

  const silenceExpression = /silence_end: (?<end>\d+\.\d+) \| silence_duration: (?<duration>\d+\.\d+)/;

  return new Promise((resolve, reject) => {
    const results = [];

    const ffmpegProcess = spawn(
      ffmpegPath,
      ffmpegArgs,
      {
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );

    ffmpegProcess.on('error', (err) => {
      console.log('error');
      reject(err);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      const match = `${data}`.match(silenceExpression);

      if (match) {
        const { end, duration } = match.groups;

        if (!!end && !!duration) {
          results.push({ end, duration });
        }
      }
    });

    ffmpegProcess.on('close', (code) => {
      if (code !== 0) {
        console.log(code);
        reject(new Error(`ffmpeg exited with non-zero code: ${code}`));
      }

      resolve({ silence: results });
    });
  });
};
