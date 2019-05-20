import { analyseLogger as logger } from 'bbcat-orchestration-builder-logging';
import { spawn } from 'child_process';
import { path as ffprobePath } from 'ffprobe-static';
import { path as ffmpegPath } from 'ffmpeg-static';
import ffprobe from 'ffprobe-client';

const MIN_SILENCE_DURATION = 1;
const MAX_BUFFER_DURATION = 10;
const EXTEND_ITEM_DURATION = 0.1;
const SILENCE_NOISE_FLOOR = '-80dB';

const TIME_DECIMALS = 2;
const roundTime = t => parseFloat(parseFloat(t).toFixed(TIME_DECIMALS));

/**
 * Run ffmpeg on the file with a null target to detect silent sections in the audio content.
 *
 * @returns {Promise}
 */
const processItems = (filePath) => {
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
  return ffprobe(filePath, { path: ffprobePath })
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
        logger.warn('ffmpeg error', err);
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
          logger.warn(`ffmpeg exit code: ${code}`);
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

export default processItems;
