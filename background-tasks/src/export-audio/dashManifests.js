import {
  ENCODE_BITRATE,
  SAFARI_SEGMENT_MEDIA,
  segmentDuration,
} from '../encodingConfig';

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

/**
 * Generates a DASH manifest
 *
 * @param outputName name (folder name) of the rendering item.
 * @param baseUrl baseUrl to where the media is hosted on the server, no trailing slash
 * @param duration duration of the encoded media to use in the manifest
 *
 * @returns {string} the content of the compiled manifest
 */
export const dashManifest = (outputName, baseUrl, duration, sampleRate, segmentTemplateAttributes) => {
  const minBufferTime = formatPT(2 * segmentDuration(sampleRate));
  const durationPT = formatPT(duration);
  const segmentDurationPT = formatPT(segmentDuration(sampleRate));
  const periodStartPT = formatPT(0);
  const adaptationSetId = '0'; // TODO hard-coded '0' in library should be taken from sequence.json.
  const representationAudioSamplingRate = sampleRate;
  const representationBandwidth = ENCODE_BITRATE;
  const timescale = sampleRate;
  const dashSegmentDuration = timescale * segmentDuration(sampleRate);

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
    `      <SegmentTemplate timescale="${timescale}" duration="${dashSegmentDuration}" ${segmentTemplateAttributes} />`,
    '    </AdaptationSet>',
    '  </Period>',
    '</MPD>',
  ].join('\n');
};


export const safariDashManifest = (outputName, baseUrl, duration, sampleRate) => dashManifest(
  outputName,
  baseUrl,
  duration,
  sampleRate,
  `media="${SAFARI_SEGMENT_MEDIA}" startNumber="0"`,
);

export const headerlessDashManifest = (outputName, baseUrl, duration, sampleRate) => dashManifest(
  outputName,
  baseUrl,
  duration,
  sampleRate,
  'initialization="init-stream$RepresentationID$.m4s" media="chunk-stream$RepresentationID$-$Number%05d$.m4s" startNumber="1"',
);
