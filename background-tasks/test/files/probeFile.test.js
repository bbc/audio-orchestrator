import ffprobe from 'ffprobe-client';
import probeFile from '../../src/files/probeFile';

const mockProbeResults = {
  streams: [{
    codec_type: 'audio',
    sample_rate: '12300',
    channels: '42',
    duration: '1234.5678',
  }],
};

jest.mock('ffprobe-client', () => jest.fn(() => Promise.resolve(mockProbeResults)));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('probeFile', () => {
  it('calls ffprobe and returns results from it', () => probeFile('/dev/null')
    .then(({ probe }) => {
      expect(ffprobe).toHaveBeenCalledWith('/dev/null', expect.any(Object));
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
