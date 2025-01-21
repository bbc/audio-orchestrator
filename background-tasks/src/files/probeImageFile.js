/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import ffprobe from 'ffprobe-client';
import which from '../which.js';

const allowedCodecNames = ['png', 'mjpeg', 'gif'];

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

    // eslint-disable-next-line camelcase
    const { codec_name, width, height } = stream;

    if (!allowedCodecNames.includes(codec_name) || !width || !height) {
      throw new Error('File is not of a supported image type (GIF, PNG, or JPG).');
    }

    const probe = {
      // eslint-disable-next-line camelcase
      codec_name,
      width,
      height,
    };

    return { probe };
  });

export default probeFile;
