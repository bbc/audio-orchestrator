import { mkdtemp } from 'fs-extra';
import encodeItems from '../../src/files/encodeItems';

// mockExecFile as a jest mock function to easily change resolved values for
const mockExecFile = jest.fn(() => Promise.resolve({ stdout: '', stderr: '' }));

jest.mock('../../src/which', () => jest.fn(name => Promise.resolve(name)));

// child_process.execFile as a CPS function wrapping the promise based mockExecFile.
jest.mock('child_process', () => ({
  execFile: (file, args, options, cb) => { // TODO - different from definition used in detectItems tests!
    mockExecFile(file, args)
      .then((result) => { cb(null, result); })
      .catch((err) => { cb(err, null); });
  },
}));

jest.mock('async/mapSeries', () => (args, fn) => Promise.all(args.map(arg => new Promise((resolve, reject) => {
  fn(arg, (err, result) => {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  });
}))));

jest.mock('fs-extra', () => ({
  mkdir: jest.fn(() => Promise.resolve()),
  mkdtemp: jest.fn(() => Promise.resolve('')),
  mkdtempSync: jest.fn(() => ''),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('encodeItems', () => {
  it('runs ffmpeg', () => {
    const mockFilePath = '/dev/null';
    const mockItems = [
      { start: 0, duration: 2, type: 'buffer' },
      { start: 4, duration: 2, type: 'buffer' },
      { start: 6, duration: 20, type: 'dash' },
      { start: 29, duration: 4, type: 'dash' },
    ];

    return encodeItems(mockFilePath, mockItems, 1)
      .then(({ encodedItems, encodedItemsBasePath }) => {
        expect(mockExecFile).toHaveBeenCalledWith(
          expect.any(String),
          expect.arrayContaining([mockFilePath]),
        );
        expect(mockExecFile).toHaveBeenCalledTimes(mockItems.length);
        expect(encodedItems).toEqual(expect.any(Array));
        expect(encodedItemsBasePath).toEqual(expect.any(String));
      });
  });

  it('creates a temporary directory if none is given', () => encodeItems('', [], 48000, 1)
    .then(() => {
      expect(mkdtemp).toHaveBeenCalled();
    }));

  it('does not create a temporary directory if one was given', () => encodeItems('', [], 48000, 1, '/dev/null')
    .then(() => {
      expect(mkdtemp).not.toHaveBeenCalled();
    }));
});
