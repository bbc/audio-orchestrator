// Sample rate in Hz
// TODO assuming a fixed sample rate, maybe use ffprobe output instead
export const SAMPLE_RATE = 48000;

// Codec to use with ffmpeg
// TODO prefer 'libfdk_aac', but this cannot be shipped as a binary due to its license.
export const ENCODE_CODEC = 'aac';

// Bitrate
export const ENCODE_BITRATE = '128k';

// File extension
export const BUFFER_EXTENSION = '.m4a';

// Segment duration in seconds, to align with AAC block size
// 4.096 seconds at 48kHz
export const SEGMENT_DURATION = (192 * 1024) / SAMPLE_RATE;

// Segment name template for ffmpeg
export const SAFARI_SEGMENT_NAMES = `safari_%05d${BUFFER_EXTENSION}`;

// Equivalent pattern for use in DASH manifests
export const SAFARI_SEGMENT_MEDIA = `safari_$Number%05d$${BUFFER_EXTENSION}`; // different placeholder format for use in manifest

// Duration of silence to be added to the end of DASH stream to mask bbcat-js playback error.
export const SILENCE_DURATION = SEGMENT_DURATION;
