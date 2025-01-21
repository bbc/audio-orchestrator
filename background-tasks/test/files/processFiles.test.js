import { createRequire } from 'node:module';
import { jest } from '@jest/globals';

const require = createRequire(import.meta.url);

jest.mock('async/mapLimit', () => jest.fn(
  (args, concurrency, fn) => Promise.all(args.map(arg => new Promise((resolve, reject) => {
    fn(arg, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  }))),
));

const mapLimit = require('async/mapLimit.js');

const { default: processFiles } = await import('../../src/files/processFiles.js');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('processFiles', () => {
  it('calls mapLimit', () => processFiles(() => {}, [], () => {})
    .then(({ result }) => {
      expect(result).toHaveLength(0);
      expect(mapLimit).toHaveBeenCalledTimes(1);
    }));

  it('passes on worker results and errors', () => {
    const mockWorker = jest.fn(arg => Promise.resolve()
      .then(() => {
        if (arg.fileId === '2') {
          throw new Error('mock error');
        }
        return { mockResult: 'foo-bar' };
      }));

    return processFiles(mockWorker, [
      { fileId: '1' },
      { fileId: '2' },
      { fileId: '3' },
    ], () => {})
      .then(({ result }) => {
        expect(result).toEqual(expect.arrayContaining([
          { fileId: '1', success: true, mockResult: 'foo-bar' },
          { fileId: '2', success: false, error: 'mock error' },
          { fileId: '3', success: true, mockResult: 'foo-bar' },
        ]));
      });
  });
});
