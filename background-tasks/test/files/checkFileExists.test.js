import { createRequire } from 'node:module';
import { jest } from '@jest/globals';

const require = createRequire(import.meta.url);

jest.mock('fs-extra', () => ({
  stat: jest.fn(() => {}),
}));

const fse = require('fs-extra');

const { default: checkFileExists } = await import('../../src/files/checkFileExists.js');

beforeEach(() => {
  jest.restoreAllMocks();
});

describe('checkFileExists', () => {
  it('calls stat', () => {
    fse.stat.mockReturnValueOnce(Promise.resolve());
    return checkFileExists('/dev/null').then((result) => {
      expect(result).toBe(true);
      expect(fse.stat).toHaveBeenCalled();
    });
  });

  it('passes on a stat error', () => {
    fse.stat.mockRejectedValueOnce(new Error('mock stat error'));
    return expect(checkFileExists('/dev/null')).rejects.toEqual(expect.any(Error));
  });
});
