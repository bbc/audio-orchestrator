import generateSequenceMetadata from '../../src/export-audio/generateSequenceMetadata';

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('generateSequenceMetadata', () => {
  it('returns an object with the expected sequence properties', () => {
    const sequence = {};
    const settings = {};
    const files = {};

    const result = generateSequenceMetadata(
      sequence,
      settings,
      files,
    );

    expect(result).toEqual({
      duration: expect.any(Number),
      loop: expect.any(Boolean),
      outPoints: expect.any(Array),
      objects: expect.any(Array),
    });
  });

  it('transforms items for the objects in the sequence', () => {
    const fileId = 'mock-file';
    const sequenceId = 'mock-sequence';

    const sequence = {
      sequenceId,
      objects: [
        {
          objectNumber: 1,
          label: 'mock-object',
          fileId,
          orchestration: {},
          channelMapping: 'center',
        },
      ],
    };

    const settings = {
      baseUrl: 'http://mock.example.com/audio',
    };

    const files = {
      [fileId]: {
        probe: {
          duration: 15,
        },
        encodedItems: [
          {
            start: 1.5,
            duration: 8.7,
            type: 'buffer',
            relativePath: '1/0001.m4a',
          },
          {
            start: 13,
            duration: 2,
            type: 'buffer',
            relativePath: '1/0002.m4a',
          },
        ],
      },
    };

    const result = generateSequenceMetadata(
      sequence,
      settings,
      files,
    );

    expect(result).toEqual({
      duration: files[fileId].probe.duration,
      loop: expect.any(Boolean),
      outPoints: expect.any(Array),
      objects: expect.arrayContaining([
        {
          objectId: '1-mock-object',
          orchestration: expect.any(Object),
          items: expect.arrayContaining([
            {
              start: 1.5,
              duration: 8.7,
              source: {
                channelMapping: 'center',
                type: 'buffer',
                url: 'http://mock.example.com/audio/mock-sequence/1/0001.m4a',
                urlSafari: null,
              },
            },
            {
              start: 13,
              duration: 2,
              source: {
                channelMapping: 'center',
                type: 'buffer',
                url: 'http://mock.example.com/audio/mock-sequence/1/0002.m4a',
                urlSafari: null,
              },
            },
          ]),
        },
      ]),
    });
  });
});
