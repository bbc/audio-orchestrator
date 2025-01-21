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
*/// import { analyseLogger as logger } from '#logging';
import ffprobe from 'ffprobe-client';
import which from '../which.js';

const TIME_DECIMALS = 2;
const roundTime = t => parseFloat(parseFloat(t).toFixed(TIME_DECIMALS));

/**
 * Run ffprobe on the file and verify that the first stream is an audio stream.
 *
 * @returns {Promise}
 */
const probeFile = filePath => which('ffprobe')
  .then(path => ffprobe(filePath, { path }))
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
      sampleRate: parseInt(sample_rate, 10),
      numChannels: parseInt(channels, 10),
      duration: roundTime(duration),
    };

    return { probe };
  });

export default probeFile;
