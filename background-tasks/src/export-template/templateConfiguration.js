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
      next,
    }) => ({
      name, // for template code readability only
      contentId: formatContentId(sequenceId),
      url: `${settings.baseUrl}/${sequenceId}/sequence.json`,
      hold,
      skippable,
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
  } else {
    configuration.CLOUDSYNC_ENDPOINT = { hostname: 'cloudsync.virt.ch.bbc.co.uk' };
  }

  if (settings.title) {
    configuration.TEXT_TITLE = settings.title;
  }

  if (settings.subtitle) {
    configuration.TEXT_SUBTITLE = settings.subtitle;
  }

  if (settings.introduction) {
    configuration.TEXT_INTRODUCTION = settings.introduction;
  }

  if (settings.startLabel) {
    configuration.TEXT_START_LABEL = settings.startLabel;
  }

  if (settings.joinLabel) {
    configuration.TEXT_JOIN_LABEL = settings.joinLabel;
  }

  if (settings.accentColour) {
    configuration.ACCENT_COLOUR = settings.accentColour;
  }

  if (settings.enableDebugUI !== undefined) {
    configuration.DEBUG_UI = settings.enableDebugUI;
  }

  if (settings.enableTutorial !== undefined) {
    configuration.ENABLE_TUTORIAL = settings.enableTutorial;
  }

  if (settings.compressorRatio !== undefined && !Number.isNaN(settings.compressorRatio)) {
    configuration.MDO_COMPRESSOR_RATIO = settings.compressorRatio;
  }

  if (settings.compressorThreshold !== undefined && !Number.isNaN(settings.compressorThreshold)) {
    configuration.MDO_COMPRESSOR_THRESHOLD = settings.compressorThreshold;
  }

  if (settings.enableTutorial !== undefined) {
    configuration.ENABLE_TUTORIAL = settings.enableTutorial;
  }

  if (settings.playerImageId) {
    configuration.PLAYER_IMAGE_URL = imageUrls[settings.playerImageId];
  }

  return JSON.stringify(configuration, null, 2);
};

export default templateConfiguration;
