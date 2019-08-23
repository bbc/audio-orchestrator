import FileStore from '../../src/files/FileStore';
import processFiles from '../../src/files/processFiles';

jest.mock('../../src/files/processFiles', () => jest.fn(() => Promise.resolve()));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('FileStore', () => {
  it('exists', () => {
    const f = new FileStore();
    expect(f).toEqual(expect.any(Object));
  });

  it('can register and get file objects', () => {
    const f = new FileStore();

    f.registerFile('1234', '/dev/null');
    const returnedFile = f.getFile('1234');

    expect(returnedFile.fileId).toBe('1234');
  });

  // TODO all the following tests are very similar and don't really test anything useful...
  //  * probeFiles, detectItems, encodeFiles, all call processFiles with a function that just calls
  //    through to a function on the AudioFile object.
  //  * It'd be more interesting to test those...
  it('can process registerFiles (and check they exist)', () => {
    const f = new FileStore();

    const fileId = '1234';
    f.registerFile(fileId, '/dev/null');
    const file = f.getFile(fileId);

    processFiles.mockImplementation((fn, args) => Promise.all(args.map(fn))
      .then(result => ({ result })));

    const mockExists = jest.spyOn(file, 'exists')
      .mockImplementation(() => Promise.resolve({ foo: 'bar' }));

    // Ensure the file isn't actually registered
    const mockRegisterFile = jest.spyOn(f, 'registerFile')
      .mockImplementation(() => {});

    return f.registerFiles([{ fileId, path: '/foo/bar' }], () => {})
      .then(({ result }) => {
        expect(mockRegisterFile).toHaveBeenCalledWith(
          fileId,
          '/foo/bar',
        );
        expect(processFiles).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Array),
          expect.any(Function),
        );
        expect(mockExists).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expect.arrayContaining([
          { foo: 'bar' }, // fileId and success get added by processFiles (not in mock)
        ]));
      });
  });

  it('can process probeFiles', () => {
    const f = new FileStore();

    const fileId = '1234';
    f.registerFile(fileId, '/dev/null');
    const file = f.getFile(fileId);

    processFiles.mockImplementation((fn, args) => Promise.all(args.map(fn))
      .then(result => ({ result })));

    const mockRunProbe = jest.spyOn(file, 'runProbe')
      .mockImplementation(() => Promise.resolve({ foo: 'bar' }));

    return f.probeFiles([{ fileId }], () => {})
      .then(({ result }) => {
        expect(processFiles).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Array),
          expect.any(Function),
        );
        expect(mockRunProbe).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expect.arrayContaining([
          { foo: 'bar' }, // fileId and success get added by processFiles (not in mock)
        ]));
      });
  });

  it('can process detectItems', () => {
    const f = new FileStore();

    const fileId = '1234';
    f.registerFile(fileId, '/dev/null');
    const file = f.getFile(fileId);

    processFiles.mockImplementation((fn, args) => Promise.all(args.map(fn))
      .then(result => ({ result })));

    const mockDetectItems = jest.spyOn(file, 'detectItems')
      .mockImplementation(() => Promise.resolve({ foo: 'bar' }));

    return f.detectItems([{ fileId }], () => {})
      .then(({ result }) => {
        expect(processFiles).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Array),
          expect.any(Function),
        );
        expect(mockDetectItems).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expect.arrayContaining([
          { foo: 'bar' }, // fileId and success get added by processFiles (not in mock)
        ]));
      });
  });

  it('can process encodeFiles', () => {
    const f = new FileStore();

    const fileId = '1234';
    f.registerFile(fileId, '/dev/null');
    const file = f.getFile(fileId);

    processFiles.mockImplementation((fn, args) => Promise.all(args.map(fn))
      .then(result => ({ result })));

    const mockEncode = jest.spyOn(file, 'encode')
      .mockImplementation(() => Promise.resolve({ foo: 'bar' }));

    return f.encodeFiles([{ fileId }], () => {})
      .then(({ result }) => {
        expect(processFiles).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Array),
          expect.any(Function),
        );
        expect(mockEncode).toHaveBeenCalledTimes(1);
        expect(result).toEqual(expect.arrayContaining([
          { foo: 'bar' }, // fileId and success get added by processFiles (not in mock)
        ]));
      });
  });
});
