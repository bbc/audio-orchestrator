import { analyseLogger as logger } from 'bbcat-orchestration-builder-logging';
import { promisify } from 'util';
import {
  writeFile as writeFileCB,
  mkdir as mkdirCB,
} from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { path as ffmpegPath } from 'ffmpeg-static';
import mapSeries from 'async/mapSeries';

const writeFile = promisify(writeFileCB);
const mkdir = promisify(mkdirCB);

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

/**
 * Formats a time in seconds as a presentation timestamp used in DASH manifests.
 *
 * ```
 * formatPT(64.2); // => 'PT1M4.2S'
 * ```
 */
function formatPT(seconds) {
  return `PT${Math.floor(seconds / 60)}M${(seconds % 60).toFixed(2)}S`;
}


const SAMPLE_RATE = 48000; // TODO assuming a fixed sample rate, maybe use ffprobe output instead
const ENCODE_CODEC = 'aac'; // TODO prefer 'libfdk_aac', but this cannot be shipped as a binary due to its license.
const ENCODE_BITRATE = '128k';
const BUFFER_EXTENSION = '.m4a';
const SEGMENT_DURATION = (192 * 1024) / SAMPLE_RATE; // 4.096 seconds at 48kHz
const SAFARI_SEGMENT_NAMES = `safari_%05d${BUFFER_EXTENSION}`; // ffmpeg format string for outputting segments
const SAFARI_SEGMENT_MEDIA = `safari_$Number%05d$${BUFFER_EXTENSION}`; // different placeholder format for use in manifest

const dashArgs = [
  '-c:a', ENCODE_CODEC,
  '-use_template', 1,
  '-use_timeline', 0,
  '-seg_duration', SEGMENT_DURATION,
  '-f', 'dash',
];

const sarafiDashArgs = [
  '-c:a', ENCODE_CODEC,
  '-frame_size', 1024,
  '-b:a', ENCODE_BITRATE,
  '-f', 'segment',
  '-segment_time', SEGMENT_DURATION,
];

/**
 * Generates a DASH manifest
 *
 * @param outputName name (folder name) of the rendering item.
 * @param baseUrl baseUrl to where the media is hosted on the server, no trailing slash
 * @param duration duration of the encoded media to use in the manifest
 *
 * @returns {string} the content of the compiled manifest
 */
const generateDashManifest = (outputName, baseUrl, duration, segmentTemplateAttributes) => {
  const minBufferTime = formatPT(2 * SEGMENT_DURATION);
  const durationPT = formatPT(duration);
  const segmentDurationPT = formatPT(SEGMENT_DURATION);
  const periodStartPT = formatPT(0);
  const adaptationSetId = '0'; // TODO hard-coded '0' in library should be taken from sequence.json.
  const representationAudioSamplingRate = SAMPLE_RATE;
  const representationBandwidth = ENCODE_BITRATE;
  const timescale = SAMPLE_RATE;
  const segmentDuration = timescale * SEGMENT_DURATION;

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<MPD',
    '  type="static" xmlns="urn:mpeg:dash:schema:mpd:2011" profiles="urn:dvb:dash:profile:dvb-dash:2014,urn:dvb:dash:profile:dvb-dash:isoff-ext-live:2014"',
    `  minBufferTime="${minBufferTime}"`,
    `  mediaPresentationDuration="${durationPT}"`,
    `  maxSegmentDuration="${segmentDurationPT}"`,
    '>',
    `  <BaseURL>${baseUrl}/${outputName}/</BaseURL>`,
    `  <Period start="${periodStartPT}" duration="${durationPT}">`,
    `    <AdaptationSet id="${adaptationSetId}" contentType="audio" segmentAlignment="true" mimeType="audio/mp4">`,
    `      <Representation id="0" mimeType="audio/mp4" codecs="mp4a.40.2" bandwidth="${representationBandwidth}" audioSamplingRate="${representationAudioSamplingRate}" />`,
    '      <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="1" />',
    `      <SegmentTemplate timescale="${timescale}" duration="${segmentDuration}" ${segmentTemplateAttributes} />`,
    '    </AdaptationSet>',
    '  </Period>',
    '</MPD>',
  ].join('\n');
};


const generateSafariDashManifest = (outputName, baseUrl, duration) => generateDashManifest(
  outputName,
  baseUrl,
  duration,
  `media="${SAFARI_SEGMENT_MEDIA}" startNumber="0"`,
);

const generateHeaderlessDashManifest = (outputName, baseUrl, duration) => generateDashManifest(
  outputName,
  baseUrl,
  duration,
  'initialization="init-stream$RepresentationID$.m4s" media="chunk-stream$RepresentationID$-$Number%05d$.m4s" startNumber="1"',
);

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
  sequenceId,
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
            '-t', duration,
            path.join(encodedItemsBasePath, resultItem.relativePath),
          ];
        case 'dash':
          // For DASH streams, two outputes (with and without segment headers) are required to
          // support all browsers. Both are stored in the same directory, using different naming
          // schemes for manifests and segments, but generated from a single ffmpeg command.
          resultItem.relativePath = path.join(outputName, 'manifest.mpd');
          resultItem.relativePathSafari = path.join(outputName, 'manifest-safari.mpd');
          return [
            ...inputArgs,
            ...dashArgs,
            '-t', duration,
            path.join(encodedItemsBasePath, resultItem.relativePath),
            ...sarafiDashArgs,
            '-t', duration,
            path.join(encodedItemsBasePath, outputName, SAFARI_SEGMENT_NAMES),
          ];
        default:
          throw new Error(`Unknown item type ${type}`);
      }
    })
    .then(args => new Promise((resolve, reject) => {
      logger.debug(args.join(' '));
      const ffmpegProcess = spawn(
        ffmpegPath,
        args,
        { stdio: 'ignore' },
      );

      // When the ffmpeg process errors, reject.
      ffmpegProcess.on('error', (err) => {
        reject(err);
      });

      // When the process exits, resolve (or reject on error).
      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffmpeg (encode) exited with non-zero code: ${code}`));
          return;
        }

        resolve();
      });
    }))
    .then(() => {
      // create the DASH manifests
      if (type === 'dash') {
        const baseUrl = `audio/${sequenceId}`;

        return Promise.all([
          writeFile(
            path.join(encodedItemsBasePath, resultItem.relativePath),
            generateHeaderlessDashManifest(outputName, baseUrl, duration),
          ),
          writeFile(
            path.join(encodedItemsBasePath, resultItem.relativePathSafari),
            generateSafariDashManifest(outputName, baseUrl, duration),
          ),
        ]);
      }
      return null;
    })
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
 * @returns {Promise}
 */
const processEncode = (
  filePath,
  {
    items,
    encodedItemsBasePath,
    sequenceId,
  },
) => new Promise((resolve, reject) => {
  // Return a promise that resolves to the encodedItemsBasePath and encodedItems with relative
  // paths. Encode items one-by-one in series using the mapSeries async abstraction.
  mapSeries(
    items.map((item, index) => ({
      ...item,
      filePath,
      encodedItemsBasePath,
      index,
      sequenceId,
    })),
    encodeItem,
    (err, encodedItems) => {
      if (err) {
        logger.warn('rejected in processEncode');
        reject(err);
      } else {
        resolve(encodedItems);
      }
    },
  );
}).then(encodedItems => ({
  encodedItemsBasePath,
  encodedItems,
}));

export default processEncode;
