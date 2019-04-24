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

const MIN_SILENCE_DURATION = 1;
const MAX_BUFFER_DURATION = 10;
const EXTEND_ITEM_DURATION = 0.1;
const SILENCE_NOISE_FLOOR = '-80dB';

const TIME_DECIMALS = 2;
const roundTime = t => parseFloat(parseFloat(t).toFixed(TIME_DECIMALS));

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
      duration: roundTime(duration),
    };

    return { probe };
  });

/**
 * Run ffmpeg on the file with a null target to detect silent sections in the audio content.
 *
 * @returns {Promise}
 */
export const processItems = (filePath) => {
  // ffmpeg arguments
  const ffmpegArgs = [
    '-i', filePath, // input file path
    '-af', `silencedetect=n=${SILENCE_NOISE_FLOOR}:d=${MIN_SILENCE_DURATION}`, // audio filter
    '-f', 'null', // null output format
    '-', // output to stdout
  ];

  const silenceExpression = /silence_end: (?<end>\d+\.\d+) \| silence_duration: (?<duration>\d+\.\d+)/;

  // probe the file (again)
  // then get the duration from the probe results
  // then run the silence analysis
  // then convert the results to items format
  return ffprobe(filePath)
    .then(data => data.streams[0].duration)
    .then(fileDuration => new Promise((resolve, reject) => {
      const silence = [];

      const ffmpegProcess = spawn(
        ffmpegPath,
        ffmpegArgs,
        {
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      // When the ffmpeg process errors, reject.
      ffmpegProcess.on('error', (err) => {
        console.log('error');
        reject(err);
      });

      // When a new line of output is received, create a silence entry if it matches the regex.
      ffmpegProcess.stderr.on('data', (data) => {
        const match = `${data}`.match(silenceExpression);

        if (match) {
          const { end, duration } = match.groups;

          if (!!end && !!duration) {
            silence.push({ end, duration });
          }
        }
      });

      // When the process exits, resolve (or reject on error).
      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          console.log(code);
          reject(new Error(`ffmpeg exited with non-zero code: ${code}`));
          return;
        }

        resolve({ fileDuration, silence });
      });
    }))
    .then(({ fileDuration, silence }) => {
      const items = [];
      let nextStart = 0;

      // create the items ({ start, duration }) between the silent sections ({ end, duration }).
      silence.forEach((s) => {
        const start = nextStart; // this item starts where the previous silence ended
        const end = s.end - s.duration; // this item ends where this silence begins
        const duration = end - start; // this item lasts from its start to its end
        nextStart = s.end; // the next item starts where this silence ends.

        // the first silence will generate a 0-duration item if the file begins with silence,
        // so don't push that item.
        if (duration > 0) {
          items.push({ start, duration });
        }
      });

      // Complete the last item (from end of last silence to end of file).
      // This also creates the only item, lasting for the entire file, if no silence was found.
      if (roundTime(nextStart) !== roundTime(fileDuration)) {
        items.push({ start: nextStart, duration: fileDuration - nextStart });
      }

      // decide if the item should be encoded as a dash stream or a buffer, based on its duration.
      // and extend the item by a small amount at the start and end, then round it.
      return {
        items: items.map(({ start, duration }) => ({
          start: roundTime(Math.max(0, start - EXTEND_ITEM_DURATION / 2)),
          duration: roundTime(Math.min(fileDuration, duration + EXTEND_ITEM_DURATION)),
          type: (duration > MAX_BUFFER_DURATION ? 'dash' : 'buffer'),
        })),
      };
    });
};
