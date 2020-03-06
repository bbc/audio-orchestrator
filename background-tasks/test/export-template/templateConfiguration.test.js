import templateConfiguration from '../../src/export-template/templateConfiguration';

describe('templateConfiguration', () => {
  const controls = [];

  it('returns a valid JSON string', () => {
    const sequences = [];
    const settings = {};

    const result = templateConfiguration(sequences, controls, settings);

    expect(() => JSON.parse(result)).not.toThrow();
    expect(JSON.parse(result)).toEqual(expect.any(Object));
  });

  it('includes the expected config properties', () => {
    const sequences = [{
      sequenceId: 'mock-sequence-id',
      next: [],
    }];

    const settings = {
      joiningLink: 'http://example.com',
    };

    const result = JSON.parse(templateConfiguration(sequences, controls, settings));

    expect(result).toEqual(expect.objectContaining({
      JOIN_URL: settings.joiningLink,
      LOCAL_SESSION_ID_PREFIX: expect.any(String),
      INITIAL_CONTENT_ID: expect.any(String),
      SEQUENCE_URLS: expect.any(Array),
      CONTROLS: expect.any(Array),
      CLOUDSYNC_ENDPOINT: expect.any(Object),
    }));
  });

  it('sets the cloudsync endpoint if set', () => {
    const sequences = [];

    const result1 = JSON.parse(templateConfiguration(sequences, controls, {}));
    const result2 = JSON.parse(templateConfiguration(
      sequences,
      controls,
      {
        cloudSyncHostname: 'localhost',
      },
    ));

    expect(result1).toEqual(expect.objectContaining({
      CLOUDSYNC_ENDPOINT: {
        hostname: 'cloudsync.virt.ch.bbc.co.uk',
      },
    }));

    expect(result2).toEqual(expect.objectContaining({
      CLOUDSYNC_ENDPOINT: {
        hostname: 'localhost',
      },
    }));
  });

  it('sets text and style customisation properties', () => {
    const sequences = [{
      sequenceId: 'mock-sequence-id',
      next: [],
    }];

    const settings = {
      joiningLink: 'http://example.com',
      title: 'foo',
      subtitle: 'something',
      introduction: 'bar',
      startLabel: 'go',
      joinLabel: 'join',
      accentColour: '#ffcc33',
    };

    const result = JSON.parse(templateConfiguration(sequences, controls, settings));

    expect(result).toEqual(expect.objectContaining({
      TEXT_TITLE: settings.title,
      TEXT_SUBTITLE: settings.subtitle,
      TEXT_INTRODUCTION: settings.introduction,
      TEXT_START_LABEL: settings.startLabel,
      TEXT_JOIN_LABEL: settings.joinLabel,
      ACCENT_COLOUR: settings.accentColour,
    }));
  });

  it('sets compressor settings', () => {
    const sequences = [];

    const settings = {
      compressorRatio: 12,
      compressorThreshold: -20,
    };

    const result = JSON.parse(templateConfiguration(sequences, controls, settings));

    expect(result).toEqual(expect.objectContaining({
      MDO_COMPRESSOR_RATIO: settings.compressorRatio,
      MDO_COMPRESSOR_THRESHOLD: settings.compressorThreshold,
    }));
  });

  it('sets UI flags', () => {
    const sequences = [];

    const settings = {
      enableTutorial: true,
      enableDebugUI: true,
    };

    const result = JSON.parse(templateConfiguration(sequences, controls, settings));

    expect(result).toEqual(expect.objectContaining({
      ENABLE_TUTORIAL: settings.enableTutorial,
      DEBUG_UI: settings.enableDebugUI,
    }));
  });
});
