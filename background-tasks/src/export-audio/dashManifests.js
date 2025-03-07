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

import {
  ENCODE_BITRATE,
  SAFARI_SEGMENT_MEDIA,
  segmentDuration,
} from '../encodingConfig.js';

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
 * @param {string} outputName name (folder name) of the rendering item.
 * @param {number} baseUrl baseUrl to where the media is hosted on the server, no trailing slash
 * @param {number} duration duration of the encoded media to use in the manifest
 * @param {number} sampleRate output sample rate
 * @param {number} numChannels number of channels in the media
 * @param {string} segmentTemplateAttributes additional XML attributes to include in SegmentTemplate
 *
 * @returns {string} the content of the compiled manifest
 */
export const dashManifest = (
  outputName,
  baseUrl,
  duration,
  sampleRate,
  numChannels,
  segmentTemplateAttributes,
) => {
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
    `      <AudioChannelConfiguration schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011" value="${numChannels}" />`,
    `      <SegmentTemplate timescale="${timescale}" duration="${dashSegmentDuration}" ${segmentTemplateAttributes} />`,
    '    </AdaptationSet>',
    '  </Period>',
    '</MPD>',
  ].join('\n');
};

export const safariDashManifest = (
  outputName,
  baseUrl,
  duration,
  sampleRate,
  numChannels,
) => dashManifest(
  outputName,
  baseUrl,
  duration,
  sampleRate,
  numChannels,
  `media="${SAFARI_SEGMENT_MEDIA}" startNumber="0"`,
);

export const headerlessDashManifest = (
  outputName,
  baseUrl,
  duration,
  sampleRate,
  numChannels,
) => dashManifest(
  outputName,
  baseUrl,
  duration,
  sampleRate,
  numChannels,
  'initialization="init-stream$RepresentationID$.m4s" media="chunk-stream$RepresentationID$-$Number%05d$.m4s" startNumber="1"',
);
