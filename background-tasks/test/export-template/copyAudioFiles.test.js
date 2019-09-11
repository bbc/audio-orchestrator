import fse from 'fs-extra';
import copyAudioFiles from '../../src/export-template/copyAudioFiles';

jest.mock('fs-extra', () => ({
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
    };

    return copyAudioFiles(args)
      .then((result) => {
        expect(result).toEqual(args);
      });
  });

  it('removes the audio files that came with the template', () => {
    const args = {
      outputDir: '/dev/null',
    };

    return copyAudioFiles(args)
      .then(() => {
        expect(fse.remove).toHaveBeenCalledWith(`${args.outputDir}/dist/audio`);
      });
  });

  it('copies audio files to dist folder', () => {
    const args = {
      outputDir: '/dev/null',
    };

    return copyAudioFiles(args)
      .then(() => {
        expect(fse.copy).toHaveBeenCalledWith(`${args.outputDir}/audio`, `${args.outputDir}/dist/audio`);
      });
  });
});
