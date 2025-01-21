import { jest } from '@jest/globals';

const mockExecFile = jest.fn(() => Promise.resolve({ stdout: '', stderr: '' }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

jest.unstable_mockModule('child_process', () => ({
  execFile: (file, args, cb) => {
    mockExecFile(file, args)
      .then((result) => { cb(null, result); })
      .catch((err) => { cb(err, null); });
  },
}));

jest.unstable_mockModule('../../src/which', () => ({ default: jest.fn(name => Promise.resolve(name)) }));

const { default: checkRequirements } = await import('../../src/check-requirements/index.js');

describe('checkRequirements', () => {
  it(
    'returns a promise resolving to an object with an overall success flag',
    () => expect(checkRequirements()).resolves.toMatchObject({
      result: {
        success: expect.any(Boolean),
      },
    }),
  );

  it('tries to run ffmpeg', () => checkRequirements()
    .then(() => {
      expect(mockExecFile).toHaveBeenCalledWith(
        'ffmpeg',
        expect.anything(),
      );
    }));

  it('tries to run ffprobe', () => checkRequirements()
    .then(() => {
      expect(mockExecFile).toHaveBeenCalledWith(
        'ffprobe',
        expect.anything(),
      );
    }));

  it('reports errors if exec fails', () => {
    mockExecFile.mockImplementation(() => { throw new Error('mock exec failure'); });

    return expect(checkRequirements()).resolves.toMatchObject({
      result: {
        success: false,
      },
    });
  });

  it('reports success if output is in correct format', () => {
    mockExecFile.mockImplementation(name => Promise.resolve({ stdout: `${name} version 1234-mock` }));

    return expect(checkRequirements()).resolves.toMatchObject({
      result: {
        success: true,
      },
    });
  });
});
