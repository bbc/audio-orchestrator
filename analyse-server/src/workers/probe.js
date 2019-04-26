import { promisify } from 'util';
import { path as ffprobePath } from 'ffprobe-static';
import ffprobeCB from 'node-ffprobe';

// configure the ffprobe module with the path to the bundled ffprobe
ffprobeCB.FFPROBE_PATH = ffprobePath;

// wrap callback-based methods in a promise API:
const ffprobe = promisify(ffprobeCB);

const TIME_DECIMALS = 2;
const roundTime = t => parseFloat(parseFloat(t).toFixed(TIME_DECIMALS));

/**
 * Run ffprobe on the file and verify that the first stream is an audio stream.
 *
 * @returns {Promise}
 */
const processProbe = filePath => ffprobe(filePath)
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

export default processProbe;
