import fse from 'fs-extra';
import copyAudioFiles from '../../src/export-template/copyAudioFiles';

jest.mock('fs-extra', () => ({
  readdir: jest.fn(() => Promise.resolve([])),
  remove: jest.fn(() => Promise.resolve()),
  copy: jest.fn(() => Promise.resolve()),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('copyAudioFiles', () => {
  it('returns a promise passing through arguments', () => {
    const args = {
      foo: 'bar',
      outputDir: '/dev/null',
      settings: {},
    };

    return copyAudioFiles(args)
      .then((result) => {
        expect(result).toEqual(args);
      });
  });

  it('removes the audio files that came with the template but keeps the calibration sequence', () => {
    const args = {
      outputDir: '/dev/null',
      settings: {
        enableCalibration: true,
      },
    };

    fse.readdir.mockResolvedValueOnce([
      'calibration',
      'something-else',
    ]);


    return copyAudioFiles(args)
      .then(() => {
        expect(fse.remove).toHaveBeenCalledWith(`${args.outputDir}/dist/audio/something-else`);
        expect(fse.remove).toHaveBeenCalledTimes(1);
      });
  });

  it('copies audio files to dist folder', () => {
    const args = {
      outputDir: '/dev/null',
      settings: {},
    };

    return copyAudioFiles(args)
      .then(() => {
        expect(fse.copy).toHaveBeenCalledWith(`${args.outputDir}/audio`, `${args.outputDir}/dist/audio`);
      });
  });
});
