import { analyseLogger as logger } from 'bbcat-orchestration-builder-logging';
import { promisify } from 'util';
import { execFile as execFileCB } from 'child_process';
import { path as ffprobePath } from 'ffprobe-static';
import { path as ffmpegPath } from 'ffmpeg-static';
import ffprobe from 'ffprobe-client';

const execFile = promisify(execFileCB);

const MIN_SILENCE_DURATION = 1;
const MAX_BUFFER_DURATION = 10;
const EXTEND_ITEM_DURATION = 0.1;
const SILENCE_NOISE_FLOOR = '-80dB';

const TIME_DECIMALS = 2;
const roundTime = t => parseFloat(parseFloat(t).toFixed(TIME_DECIMALS));

logger.debug(`ffmpegPath: ${ffmpegPath}.`);

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
    .then(data => roundTime(data.streams[0].duration))
    .then((fileDuration) => {
      logger.silly(`items: ${ffmpegPath} ${ffmpegArgs.join(' ')}`);

      return execFile(ffmpegPath, ffmpegArgs, { maxBuffer: 1024 * 1024 * 8 })
        .catch((error) => {
          logger.warn('ffmpeg (items) failed.');
          throw error;
        })
        .then(({ stderr }) => {
          const silence = [];

          stderr.split('\n').forEach((data) => {
            const match = `${data}`.match(silenceExpression);

            if (match && match.groups) {
              const { end, duration } = match.groups;

              if (!!end && !!duration) {
                silence.push({ end, duration });
              }
            }
          });

          return { fileDuration, silence };
        });
    })
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
