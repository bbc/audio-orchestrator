const formatContentId = sequenceId => `bbcat-orchestration:${sequenceId}`;

const templateConfiguration = (sequences, settings) => {
  const introSequence = sequences.find(({ isIntro }) => isIntro) || sequences[0] || {};

  // TODO: get actual control metadata from the settings and create it in the frontend
  // Translate tag (here still called zone) metadata to a single control
  const tagControlOptions = (settings.zones || []).map(({ name, friendlyName }) => ({
    value: name,
    label: friendlyName,
  }));

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
    CONTROLS: [
      {
        controlId: 'tag',
        controlName: 'Tag',
        controlType: 'radio',
        controlDefaultValues: ['none'],
        controlParameters: {
          options: tagControlOptions,
        },
        controlBehaviours: [
          { behaviourType: 'spread' },
          { behaviourType: 'auxDevicesOnly' },
          { behaviourType: 'allowedEverywhere' },
        ],
      },
    ],
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

  return JSON.stringify(configuration, null, 2);
};

export default templateConfiguration;
