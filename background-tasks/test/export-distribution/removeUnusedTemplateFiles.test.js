import { createRequire } from 'node:module';
import { jest } from '@jest/globals';

jest.mock('fs-extra', () => ({
  readdir: jest.fn(() => Promise.resolve([])),
  remove: jest.fn(() => Promise.resolve()),
}));

const require = createRequire(import.meta.url);
const fse = require('fs-extra');

const { default: removeUnusedTemplateFiles } = await import('../../src/export-distribution/removeUnusedTemplateFiles.js');

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('removeUnusedTemplateFiles', () => {
  it('returns a promise passing through the original arguments', () => {
    const args = {
      outputDir: '/dev/null',
      someOtherArgs: [1, 2, 3],
    };

    return removeUnusedTemplateFiles(args)
      .then((result) => {
        expect(result).toEqual(args);
      });
  });

  it('removes files in the outputDir', () => {
    const outputDir = '/dev/null';
    const args = {
      outputDir,
    };

    const filenames = ['a', 'b'];
    fse.readdir.mockResolvedValueOnce(filenames);

    return removeUnusedTemplateFiles(args)
      .then(() => {
        expect(fse.readdir).toHaveBeenCalledWith(outputDir);

        filenames.forEach((f) => {
          expect(fse.remove).toHaveBeenCalledWith(`${outputDir}/${f}`);
        });
      });
  });

  it('removes only files outside of dist/', () => {
    const outputDir = '/dev/null';
    const args = {
      outputDir,
    };

    const filenames = ['a.html', '.beerc', 'audio', 'dist'];
    fse.readdir.mockResolvedValueOnce(filenames);

    return removeUnusedTemplateFiles(args)
      .then(() => {
        expect(fse.readdir).toHaveBeenCalledWith(outputDir);

        filenames.forEach((f) => {
          if (f.startsWith('dist')) {
            expect(fse.remove).not.toHaveBeenCalledWith(`${outputDir}/${f}`);
          } else {
            expect(fse.remove).toHaveBeenCalledWith(`${outputDir}/${f}`);
          }
        });
      });
  });
});
