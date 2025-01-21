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
*/// Sample rate in Hz
// Codec to use with ffmpeg
// TODO prefer 'libfdk_aac', but this cannot be shipped as a binary due to its license.
export const ENCODE_CODEC = 'aac';

// Bitrate
export const ENCODE_BITRATE = '128k';

// File extension
export const BUFFER_EXTENSION = '.m4a';

// Segment duration in seconds, to align with AAC block size (1024 samples)
export const segmentDuration = (sampleRate) => {
  // special case for 44.1KHz, to get a decimal number of milliseconds (despite longer segments)
  if (sampleRate === 44100) {
    return (441 * 1024) / sampleRate;
  }

  // Otherwise, use the number of blocks that gives a good duration for 48KHz (4.096 seconds)
  return (192 * 1024) / sampleRate;
};

// Segment name template for ffmpeg
export const SAFARI_SEGMENT_NAMES = `safari_%05d${BUFFER_EXTENSION}`;

// Equivalent pattern for use in DASH manifests
export const SAFARI_SEGMENT_MEDIA = `safari_$Number%05d$${BUFFER_EXTENSION}`; // different placeholder format for use in manifest
