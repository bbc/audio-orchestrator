// TODO was adding a prefix; which breaks control behaviours that reference a sequenceId; but I
// don't think the prefix is really needed anyway because we already are within a unique session.
// const formatContentId = sequenceId => `bbcat-orchestration:${sequenceId}`;
const formatContentId = sequenceId => sequenceId;

const templateConfiguration = (sequences, controls, settings, imageUrls) => {
  const introSequence = sequences.find(({ isIntro }) => isIntro) || sequences[0] || {};

  const configuration = {
    JOIN_URL: settings.joiningLink,
    LOCAL_SESSION_ID_PREFIX: 'bbcat-orchestration-template',
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
  };

  if (settings.cloudSyncHostname) {
    configuration.CLOUDSYNC_ENDPOINT = { hostname: settings.cloudSyncHostname };

    const port = parseInt(settings.cloudSyncPort, 10);
    if (!Number.isNaN(port)) {
      configuration.CLOUDSYNC_ENDPOINT.port = port;
    }
  }

  configuration.TEXT_TITLE = settings.title;
  configuration.TEXT_SUBTITLE = settings.subtitle;
  configuration.TEXT_INTRODUCTION = settings.introduction;
  configuration.TEXT_START_LABEL = settings.startLabel;
  configuration.TEXT_JOIN_LABEL = settings.joinLabel;
  configuration.ACCENT_COLOUR = settings.accentColour;

  configuration.DEBUG_UI = settings.enableDebugUI;
  configuration.ENABLE_TUTORIAL = settings.enableTutorial;
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
    configuration.TEXT_PLAYER_IMAGE_ALT = settings.playerImageAltText;
  }

  if (settings.enableCalibration) {
    configuration.CALIBRATION_SEQUENCE_URL = `${settings.baseUrl}/calibration/sequence.json`;
  }

  return JSON.stringify(configuration, null, 2);
};

export default templateConfiguration;
