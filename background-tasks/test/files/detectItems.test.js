import detectItems from '../../src/files/detectItems';

// mockExecFile as a jest mock function to easily change resolved values for
const mockExecFile = jest.fn(() => Promise.resolve({ stdout: '', stderr: '' }));

// child_process.execFile as a CPS function wrapping the promise based mockExecFile.
jest.mock('child_process', () => ({
  execFile: (file, args, options, cb) => {
    mockExecFile(file, args, options)
      .then((result) => { cb(null, result); })
      .catch((err) => { cb(err, null); });
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('detectItems', () => {
  it('runs ffmpeg', () => {
    const mockFilePath = '/dev/null';
    return detectItems(mockFilePath, 0)
      .then(({ items }) => {
        expect(mockExecFile).toHaveBeenCalledWith(
          expect.any(String),
          expect.arrayContaining([mockFilePath]),
          expect.any(Object),
        );
        expect(items).toEqual(expect.any(Array));
      });
  });

  it('rejects on execFile error', () => {
    mockExecFile.mockRejectedValueOnce(new Error('mock error'));
    return expect(detectItems('', 0)).rejects.toThrow('mock error');
  });

  it('parses silence data into items', () => {
    mockExecFile.mockResolvedValueOnce({
      stderr: [
        'silence_end: 4.0 | silence_duration: 2.0',
        'silence_end: 8.0 | silence_duration: 2.0',
      ].join('\n'),
    });

    // this gets added to the duration, and half of it subtracted from the start time.
    const extendItemDuration = 0.1;

    return detectItems('', 10)
      .then(({ items }) => {
        expect(items).toEqual(expect.arrayContaining([
          { start: 0, duration: 2 + extendItemDuration, type: 'buffer' },
          { start: 4 - (extendItemDuration / 2), duration: 2 + extendItemDuration, type: 'buffer' },
          { start: 8 - (extendItemDuration / 2), duration: 2 + extendItemDuration, type: 'buffer' },
        ]));
      });
  });
});
