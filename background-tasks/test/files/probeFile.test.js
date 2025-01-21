import { createRequire } from 'node:module';
import { jest } from '@jest/globals';

const require = createRequire(import.meta.url);

jest.mock('../../src/which', () => jest.fn(name => Promise.resolve(name)));

const mockProbeResults = {
  streams: [{
    codec_type: 'audio',
    sample_rate: '12300',
    channels: '42',
    duration: '1234.5678',
  }],
};

jest.mock('ffprobe-client', () => jest.fn(() => Promise.resolve(mockProbeResults)));

const { default: probeFile } = await import('../../src/files/probeFile.js');

const ffprobe = require('ffprobe-client');

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('probeFile', () => {
  it('calls ffprobe and returns results from it', () => probeFile('/dev/null')
    .then(({ probe }) => {
      expect(ffprobe).toHaveBeenCalledWith('/dev/null', expect.anything());
      expect(probe).toEqual({
        sampleRate: 12300,
        numChannels: 42,
        duration: 1234.57,
      });
    }));

  it('throws an error if there are no streams', () => {
    ffprobe.mockResolvedValueOnce({ streams: [] });
    return expect(probeFile('/dev/null')).rejects.toEqual(expect.any(Error));
  });

  it('throws an error if the first stream is not audio', () => {
    ffprobe.mockResolvedValueOnce({
      streams: [{
        ...mockProbeResults.streams[0],
        codec_type: 'video',
      }],
    });
    return expect(probeFile('/dev/null')).rejects.toEqual(expect.any(Error));
  });
});
