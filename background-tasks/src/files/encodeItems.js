import { analyseLogger as logger } from 'bbcat-orchestration-builder-logging';
import { promisify } from 'util';
import {
  mkdir,
  mkdtemp,
  mkdtempSync,
} from 'fs-extra';
import os from 'os';
import path from 'path';
import { execFile as execFileCB } from 'child_process';
import mapSeries from 'async/mapSeries';
import which from '../which';

import {
  ENCODE_CODEC,
  ENCODE_BITRATE,
  BUFFER_EXTENSION,
  SAFARI_SEGMENT_NAMES,
  segmentDuration,
  SILENCE_SAMPLE_RATE,
  SILENCE_DURATION,
} from '../encodingConfig';

const execFile = promisify(execFileCB);

const LOG_FFMPEG = false;

// Path for temporary storing a silence.wav to use in all DASH stream encoding jobs
export const SILENCE_PATH = path.join(mkdtempSync(path.join(os.tmpdir(), 'bbcat-orchestration-')), 'silence.wav');

// Path to use as base dir for encoded audio
const OUTPUT_BASE_PATH = mkdtempSync(path.join(os.tmpdir(), 'bbcat-orchestration-encoding-'));

/**
 * Pads the given integer to minimum width by adding zeroes on the left.
 *
 * ```
 * zeroPad(17, 4); // => '0017'
 * ```
 */
const zeroPad = (num, width) => {
  const str = `${parseInt(num, 10)}`;
  return `${'0'.repeat(Math.max(0, width - str.length))}${str}`;
};

const dashArgs = sampleRate => [
  '-c:a', ENCODE_CODEC,
  '-b:a', ENCODE_BITRATE,
  '-use_template', 1,
  '-use_timeline', 0,
  '-seg_duration', segmentDuration(sampleRate),
  '-f', 'dash',
];

const sarafiDashArgs = sampleRate => [
  '-c:a', ENCODE_CODEC,
  '-b:a', ENCODE_BITRATE,
  '-frame_size', 1024,
  '-f', 'segment',
  '-segment_time', segmentDuration(sampleRate),
];

const bufferArgs = [
  '-c:a', ENCODE_CODEC,
  '-b:a', ENCODE_BITRATE,
];

const silenceArgs = [
  '-i', SILENCE_PATH,
  '-filter_complex', '[0:a] concat=n=2:v=0:a=1',
];


let silencePromise = null;

/**
 * ensures the silence file is available at SILENCE_PATH, regenerates it if it is not.
 *
 * @returns {Promise}
 */
const ensureSilence = () => {
  if (silencePromise !== null) {
    return silencePromise;
  }

  silencePromise = which('ffmpeg')
    .then(ffmpegPath => execFile(ffmpegPath, [
      '-y',
      '-f', 'lavfi',
      '-i', `anullsrc=r=${SILENCE_SAMPLE_RATE}:cl=mono`,
      '-t', segmentDuration(SILENCE_SAMPLE_RATE),
      SILENCE_PATH,
    ]))
    .then(() => {
      logger.info(`generated silence file at ${SILENCE_PATH}`);
    });

  return silencePromise;
};

/**
 * Encode a single item, returning a promise that resolves to the output file location(s) when
 * ffmpeg exits.
 *
 * - Buffer items produce a single .mp4 file in encodedItemsBasePath.
 * - Dash items produce two manifests, and two sets of segments, in a sub directory.
 *
 * The returned paths are relative to the encodedItemsBasePath - to be used as URLs in
 * sequence.json, and mainly required to pass on the item file names generated here.
 */
const encodeItem = ({
  index,
  filePath,
  encodedItemsBasePath,
  start,
  duration,
  type,
  sampleRate,
}, callback) => {
  // create a result item, to be populated with relativePath (and relativePathSafari) fields below.
  const resultItem = {
    start,
    duration,
    type,
  };

  // Get the input name without extension, create the item name by appending the zero-padded index.
  const { name } = path.parse(filePath);
  const outputName = `${name}_${zeroPad(index, 6)}`;

  // TODO the original encode-media script appends silence to the end of each segment using a
  // -i silence.wav -filter_complex [0:a] concat=n=2:v=0:a=1, possibly to deal with issues in the
  // WebAudio/bbcat-js DASH playback - needs investigation to see if it's still needed.

  return Promise.resolve()
    .then(() => {
      // for DASH streams, all output files are stored in a per-item directory; create this.
      if (type === 'dash') {
        return mkdir(path.join(encodedItemsBasePath, outputName));
      }
      return null;
    })
    .then(() => {
      // The input (and timing) arguments are the same regardless of item type.
      const inputArgs = [
        '-ss', start, // seek before -i, to speed up the process, and to make it count for multiple outputs.
        '-i', filePath,
      ];

      switch (type) {
        case 'buffer':
          // For buffers only a single output file is generated, just add the extension to the name.
          resultItem.relativePath = outputName + BUFFER_EXTENSION;

          return [
            ...inputArgs,
            ...bufferArgs,
            '-t', duration,
            path.join(encodedItemsBasePath, resultItem.relativePath),
          ];
        case 'dash':
          // For DASH streams, two outputs (with and without segment headers) are required to
          // support all browsers. Both are stored in the same directory, using different naming
          // schemes for manifests and segments, but generated from a single ffmpeg command.
          resultItem.relativePath = path.join(outputName, 'manifest.mpd');
          resultItem.relativePathSafari = path.join(outputName, 'manifest-safari.mpd');
          return ensureSilence().then(() => [
            ...inputArgs,
            ...silenceArgs,
            ...dashArgs(sampleRate),
            '-t', duration + SILENCE_DURATION,
            path.join(encodedItemsBasePath, resultItem.relativePath),
            ...sarafiDashArgs(sampleRate),
            '-t', duration + SILENCE_DURATION,
            path.join(encodedItemsBasePath, outputName, SAFARI_SEGMENT_NAMES),
          ]);
        default:
          throw new Error(`Unknown item type ${type}`);
      }
    })
    .then(ffmpegArgs => which('ffmpeg').then((ffmpegPath) => {
      if (LOG_FFMPEG) logger.silly(`encode: ${ffmpegPath} ${ffmpegArgs.join(' ')}`);
      return execFile(ffmpegPath, ffmpegArgs)
        .catch((error) => {
          logger.error(`ffmpeg failed (${error}) arguments were: ${ffmpegArgs.join(' ')}`);
          throw error;
        });
    }))
    .then(() => {
      // call the callback with a null error to indicate successful completion
      callback(null, resultItem);
    })
    .catch((err) => {
      // pass the error on to the callback.
      callback(err);
    });
};

/**
 * Run ffmpeg to create all the items in a temporary folder, and return their paths.
 *
 * Return a promise that resolves to the encodedItemsBasePath and encodedItems with relative
 * paths. Encode items one-by-one in series using the mapSeries async abstraction.
 *
 * @param {string} filePath
 * @param {Array<Object>} [items]
 * @param {string} [presetBasePath] - where to store the results, if not set, a new temporary
 *                                    directory will be created.
 *
 * @returns {Promise<Object>}
 */
const encodeItems = (
  filePath,
  items,
  sampleRate,
  presetBasePath,
) => {
  let encodedItemsBasePath = presetBasePath;

  return Promise.resolve()
    .then(() => {
      if (encodedItemsBasePath) {
        return encodedItemsBasePath;
      }
      return mkdtemp(path.join(OUTPUT_BASE_PATH, 'encoded-items-')).then((p) => {
        encodedItemsBasePath = p;
      });
    })
    .then(() => mapSeries(
      items.map((item, index) => ({
        ...item,
        filePath,
        encodedItemsBasePath,
        sampleRate,
        index,
      })),
      encodeItem,
    ))
    .then(encodedItems => ({
      encodedItemsBasePath,
      encodedItems,
    }));
};

export default encodeItems;
