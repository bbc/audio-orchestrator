import ffprobe from 'ffprobe-client';
import which from '../which';

const allowedCodecNames = ['png', 'mjpeg'];

/**
 * Run ffprobe on the file and verify that the first stream is a jpg or png image.
 *
 * @returns {Promise}
 */
const probeFile = filePath => which('ffprobe')
  .then(path => ffprobe(filePath, { path }))
  .then((data) => {
    // ensure there is at least one stream detected in the file and return the first one
    if (!data.streams || data.streams.length === 0) {
      throw new Error('File could not be read.');
    }
    return data.streams[0];
  })
  .then((stream) => {
    // ensure the stream is an audio stream before accessing its properties
    if (stream.codec_type !== 'video') {
      throw new Error('File does not contain image data.');
    }

    /* eslint-disable-next-line camelcase */
    const { codec_name, width, height } = stream;

    if (!allowedCodecNames.includes(codec_name) || !width || !height) {
      throw new Error('File is not of a supported image type (PNG or JPG).');
    }

    const probe = {
      codec_name,
      width,
      height,
    };

    return { probe };
  });

export default probeFile;
