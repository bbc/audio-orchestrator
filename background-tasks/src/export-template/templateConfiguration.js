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
*/// TODO was adding a prefix; which breaks control behaviours that reference a sequenceId; but I
// don't think the prefix is really needed anyway because we already are within a unique session.
// const formatContentId = sequenceId => `audio-orchestrator:${sequenceId}`;
const formatContentId = sequenceId => sequenceId;

const templateConfiguration = (sequences, controls, settings, imageUrls) => {
  const introSequence = sequences.find(({ isIntro }) => isIntro) || sequences[0] || {};

  const configuration = {
    JOIN_URL: settings.joiningLink,
    LOCAL_SESSION_ID_PREFIX: 'audio-orchestrator',
    INITIAL_CONTENT_ID: formatContentId(introSequence.sequenceId),
    SEQUENCE_URLS: sequences.map(({
      sequenceId,
      name,
      hold,
      skippable,
      instructions,
      next,
    }) => ({
      name, // for template code readability only
      contentId: formatContentId(sequenceId),
      url: `${settings.baseUrl}/${sequenceId}/sequence.json`,
      hold,
      skippable,
      instructions,
      next: next.map(option => ({
        contentId: formatContentId(option.sequenceId),
        label: option.label,
      })),
    })),
    CONTROLS: controls.map(({
      controlId,
      controlName,
      controlType,
      controlDefaultValues,
      controlParameters,
      controlBehaviours,
    }) => ({
      controlId,
      controlName,
      controlType,
      controlDefaultValues,
      controlParameters,
      controlBehaviours,
    })),
    SHOW_BBC_FOOTER: true,
  };

  configuration.SYNC_ENDPOINT = {
    type: settings.syncEndpointType,
  };

  if (settings.syncEndpointType === 'cloud-sync') {
    if (settings.cloudSyncHostname) {
      configuration.SYNC_ENDPOINT.hostname = settings.cloudSyncHostname;

      const port = parseInt(settings.cloudSyncPort, 10);
      if (!Number.isNaN(port)) {
        configuration.SYNC_ENDPOINT.port = port;
      }
    }
  }

  configuration.TEXT_TITLE = settings.title;
  configuration.TEXT_SUBTITLE = settings.subtitle;
  configuration.TEXT_INTRODUCTION = settings.introduction;
  configuration.TEXT_START_LABEL = settings.startLabel;
  configuration.TEXT_JOIN_LABEL = settings.joinLabel;
  configuration.ACCENT_COLOUR = settings.accentColour;

  configuration.DEBUG_UI = settings.enableDebugUI;
  configuration.ENABLE_PLAY_PAUSE_ON_AUX = settings.enablePlayPauseOnAux;

  if (!Number.isNaN(settings.compressorRatio)) {
    configuration.MDO_COMPRESSOR_RATIO = settings.compressorRatio;
  }

  if (!Number.isNaN(settings.compressorThreshold)) {
    configuration.MDO_COMPRESSOR_THRESHOLD = settings.compressorThreshold;
  }

  if (!Number.isNaN(settings.fadeOutDuration)) {
    configuration.OBJECT_FADE_OUT_DURATION = settings.fadeOutDuration;
  }

  if (settings.playerImageId && settings.playerImageId in imageUrls) {
    configuration.PLAYER_IMAGE_URL = imageUrls[settings.playerImageId];
    configuration.PLAYER_IMAGE_ALT = settings.playerImageAltText;
  } else {
    configuration.PLAYER_IMAGE_URL = 'images/orchestrator-default-image.jpg';
    configuration.PLAYER_IMAGE_ALT = 'Audio Orchestrator default image';
  }

  if (settings.enableCalibration) {
    configuration.CALIBRATION_SEQUENCE_URL = `${settings.baseUrl}/calibration/sequence.json`;
  }

  return JSON.stringify(configuration, null, 2);
};

export default templateConfiguration;
