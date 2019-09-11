import templateConfiguration from '../../src/export-template/templateConfiguration';

describe('templateConfiguration', () => {
  it('returns a valid JSON string', () => {
    const sequences = [];
    const settings = {};

    const result = templateConfiguration(sequences, settings);

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
      zones: [],
    };

    const result = JSON.parse(templateConfiguration(sequences, settings));

    expect(result).toEqual(expect.objectContaining({
      JOIN_URL: settings.joiningLink,
      LOCAL_SESSION_ID_PREFIX: expect.any(String),
      INITIAL_CONTENT_ID: expect.any(String),
      SEQUENCE_URLS: expect.any(Array),
      DEVICE_TAGS: expect.any(Array),
      CLOUDSYNC_ENDPOINT: expect.any(Object),
    }));
  });

  it('sets the cloudsync endpoint if set', () => {
    const sequences = [];
    const baseSettings = {
      zones: [],
    };

    const result1 = JSON.parse(templateConfiguration(sequences, baseSettings));
    const result2 = JSON.parse(templateConfiguration(
      sequences,
      {
        ...baseSettings,
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
      zones: [],
      title: 'foo',
      introduction: 'bar',
      startLabel: 'go',
      joinLabel: 'join',
      accentColour: '#ffcc33',
    };

    const result = JSON.parse(templateConfiguration(sequences, settings));

    expect(result).toEqual(expect.objectContaining({
      TEXT_TITLE: expect.any(String),
      TEXT_INTRODUCTION: expect.any(String),
      TEXT_START_LABEL: expect.any(String),
      TEXT_JOIN_LABEL: expect.any(String),
      ACCENT_COLOUR: expect.any(String),
    }));
  });
});
