import checkFileExists from '../../src/files/checkFileExists';
import probeFile from '../../src/files/probeFile';
import detectItems from '../../src/files/detectItems';
import encodeItems from '../../src/files/encodeItems';
import AudioFile from '../../src/files/AudioFile';

jest.mock('../../src/files/checkFileExists', () => jest.fn(() => Promise.resolve(true)));
jest.mock('../../src/files/probeFile', () => jest.fn(() => Promise.resolve({ probe: {} })));
jest.mock('../../src/files/detectItems', () => jest.fn(() => Promise.resolve({ items: [] })));
jest.mock('../../src/files/encodeItems', () => jest.fn(() => Promise.resolve({ encodedItems: [], encodedItemsBasePath: '' })));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

const newAudioFile = (fileId = '12345', filePath = '/dev/null') => new AudioFile(fileId, filePath);

describe('AudioFile', () => {
  describe('exists', () => {
    it('calls checkFileExists', () => {
      const af = newAudioFile();
      return af.exists()
        .then(() => {
          expect(checkFileExists).toHaveBeenCalledWith(af.filePath);
        });
    });

    it('throws an error if checkFileExists does', () => {
      const af = newAudioFile();
      checkFileExists.mockRejectedValueOnce(new Error('mock error'));
      return expect(af.exists()).rejects.toThrow('mock error');
    });
  });

  describe('runProbe', () => {
    it('calls probeFile and returns a probe object', () => {
      const af = newAudioFile();
      return af.runProbe()
        .then((result) => {
          expect(probeFile).toHaveBeenCalledWith(af.filePath);
          expect(result).toEqual({ probe: expect.any(Object) });
        });
    });

    it('only calls probeFile once', () => {
      const af = newAudioFile();

      return Promise.all([
        af.runProbe(),
        af.runProbe(),
        af.runProbe(),
      ]).then(() => {
        expect(probeFile).toHaveBeenCalledTimes(1);
      });
    });

    it('stores and returns previous results', () => {
      const af = newAudioFile();

      const mockProbeResult = { a: 'result' };

      probeFile.mockResolvedValueOnce({ probe: mockProbeResult });
      probeFile.mockResolvedValueOnce({ probe: { something: 'different' } });
      return Promise.resolve()
        .then(() => af.runProbe())
        .then(({ probe }) => {
          expect(probe).toBe(mockProbeResult); // result from first call
        })
        .then(() => af.runProbe())
        .then(({ probe }) => {
          expect(probe).toBe(mockProbeResult); // result from second call should be the same
        });
    });
  });

  describe('detectItems', () => {
    it('calls exists, runProbe, and detectItems and returns an items array', () => {
      const af = newAudioFile();
      const mockedExists = jest.spyOn(af, 'exists');
      const mockedRunProbe = jest.spyOn(af, 'runProbe');

      mockedRunProbe.mockResolvedValueOnce({ probe: { duration: 42 } });

      return af.detectItems()
        .then((result) => {
          expect(mockedExists).toHaveBeenCalled();
          expect(mockedRunProbe).toHaveBeenCalled();
          expect(detectItems).toHaveBeenCalledWith(af.filePath, 42);

          expect(result).toEqual({ items: expect.any(Array) });
        });
    });

    it('only calls detectItems once', () => {
      const af = newAudioFile();

      return Promise.all([
        af.detectItems(),
        af.detectItems(),
        af.detectItems(),
      ]).then(() => {
        expect(detectItems).toHaveBeenCalledTimes(1);
      });
    });

    it('returns and stores cachedItems instead of calling detectItems', () => {
      const af = newAudioFile();

      const mockCachedItems = [];

      return Promise.resolve()
        .then(() => af.detectItems(mockCachedItems))
        .then(({ items }) => {
          expect(detectItems).not.toHaveBeenCalled();
          expect(items).toBe(mockCachedItems);
        })
        .then(() => af.detectItems())
        .then(({ items }) => {
          expect(detectItems).not.toHaveBeenCalled();
          expect(items).toBe(mockCachedItems);
        });
    });
  });

  describe('encode', () => {
    it('calls detectItems and encodeItems', () => {
      const af = newAudioFile();

      return af.encode()
        .then(() => {
          expect(detectItems).toHaveBeenCalled();
          expect(encodeItems).toHaveBeenCalled();
        });
    });

    it('only calls encodeItems once', () => {
      const af = newAudioFile();

      return Promise.all([
        af.encode(),
        af.encode(),
        af.encode(),
      ]).then(() => {
        expect(encodeItems).toHaveBeenCalledTimes(1);
      });
    });

    it('returns and stores cachedEncodedItems instead of calling encodeItems', () => {
      const af = newAudioFile();

      const mockCachedEncodedItems = [];
      const mockCachedEncodedItemsBasePath = '/tmp/foo';

      return Promise.resolve()
        .then(() => af.encode(mockCachedEncodedItems, mockCachedEncodedItemsBasePath))
        .then(({ encodedItems, encodedItemsBasePath }) => {
          expect(encodeItems).not.toHaveBeenCalled();
          expect(encodedItems).toBe(mockCachedEncodedItems);
          expect(encodedItemsBasePath).toBe(mockCachedEncodedItemsBasePath);
        })
        .then(() => af.encode())
        .then(({ encodedItems, encodedItemsBasePath }) => {
          expect(encodeItems).not.toHaveBeenCalled();
          expect(encodedItems).toBe(mockCachedEncodedItems);
          expect(encodedItemsBasePath).toBe(mockCachedEncodedItemsBasePath);
        });
    });

    it('clears results and re-runs encode if the cachedEncodedItemsBasePath does not exist', () => {
      const af = newAudioFile();

      const mockCachedEncodedItems = [];
      const mockCachedEncodedItemsBasePath = '/tmp/foo';

      // ensure the check if base path exists fails
      checkFileExists.mockRejectedValueOnce(new Error('mock error'));

      return Promise.resolve()
        .then(() => af.encode(mockCachedEncodedItems, mockCachedEncodedItemsBasePath))
        .then(({ encodedItems, encodedItemsBasePath }) => {
          expect(encodeItems).toHaveBeenCalled();
          expect(encodedItems).not.toBe(mockCachedEncodedItems);
          expect(encodedItemsBasePath).not.toBe(mockCachedEncodedItemsBasePath);
        });
    });
  });

  it('has properties exposing the stored results', () => {
    const af = newAudioFile();

    return af.encode()
      .then(() => {
        expect(af.probe).toEqual(expect.any(Object));
        expect(af.items).toEqual(expect.any(Array));
        expect(af.encodedItems).toEqual(expect.any(Array));
        expect(af.encodedItemsBasePath).toEqual(expect.any(String));
      });
  });
});
