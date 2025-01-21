import { createRequire } from 'node:module';
import { jest } from '@jest/globals';
import path from 'path';

const require = createRequire(import.meta.url);

jest.mock('fs-extra', () => ({
  readdir: jest.fn(() => Promise.resolve([
    'node_modules',
    'audio',
    'dist',
  ])),
  copy: jest.fn(() => Promise.resolve()),
}));

const fse = require('fs-extra');

const { default: copyTemplateSources } = await import('../../src/export-template/copyTemplateSources.js');

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('copyTemplateSources', () => {
  it('returns a promise passing through arguments', () => {
    const args = {
      foo: 'bar',
      outputDir: '/dev/null',
    };

    return copyTemplateSources(args)
      .then((result) => {
        expect(result).toEqual(args);
      });
  });

  it('copies files except node_modules and audio to the outputDir', () => {
    const args = {
      outputDir: '/dev/null',
    };

    const mockFiles = [
      'node_modules',
      'audio',
      'dist',
    ];

    fse.readdir.mockResolvedValueOnce(mockFiles);

    return copyTemplateSources(args)
      .then(() => {
        expect(fse.readdir).toHaveBeenCalledTimes(1);

        // should copy everything except node_modules and audio
        expect(fse.copy).toHaveBeenCalledTimes(mockFiles.length - 2);

        mockFiles.forEach((f) => {
          const from = expect.stringContaining(f);
          const to = path.join(args.outputDir, f);

          if (f !== 'node_modules' && f !== 'audio') {
            expect(fse.copy).toHaveBeenCalledWith(from, to);
          } else {
            expect(fse.copy).not.toHaveBeenCalledWith(from, to);
          }
        });
      });
  });

  it('uses a custom template path if provided', () => {
    const customTemplatePath = '/dev/null/custom-template-path';
    const args = {
      outputDir: '/dev/null',
      settings: {
        customTemplatePath,
      },
    };

    const mockFiles = [
      'dist',
    ];

    fse.readdir.mockResolvedValueOnce(mockFiles);
    return copyTemplateSources(args)
      .then(() => {
        mockFiles.forEach((f) => {
          const from = path.join(customTemplatePath, f);
          const to = path.join(args.outputDir, f);
          expect(fse.copy).toHaveBeenCalledWith(from, to);
        });
      });
  });
});
