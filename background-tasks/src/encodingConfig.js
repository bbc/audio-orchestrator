// Sample rate in Hz
// Codec to use with ffmpeg
// TODO prefer 'libfdk_aac', but this cannot be shipped as a binary due to its license.
export const ENCODE_CODEC = 'aac';

// Bitrate
export const ENCODE_BITRATE = '128k';

// File extension
export const BUFFER_EXTENSION = '.m4a';

// Segment duration in seconds, to align with AAC block size
// 4.096 seconds at 48kHz
export const segmentDuration = sampleRate => (192 * 1024) / sampleRate;

// Segment name template for ffmpeg
export const SAFARI_SEGMENT_NAMES = `safari_%05d${BUFFER_EXTENSION}`;

// Equivalent pattern for use in DASH manifests
export const SAFARI_SEGMENT_MEDIA = `safari_$Number%05d$${BUFFER_EXTENSION}`; // different placeholder format for use in manifest

export const SILENCE_SAMPLE_RATE = 48000;
export const SILENCE_DURATION = segmentDuration(SILENCE_SAMPLE_RATE);
