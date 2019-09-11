import waitForEncoding from '../../src/export-audio/waitForEncoding';

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

const mockFileStore = {
  getFile: jest.fn(fileId => ({ fileId })),
  encodeFiles: jest.fn(() => Promise.resolve({ result: [] })),
};

describe('waitForEncoding', () => {
  it('returns a files object', () => {
    const sequences = [
      {
        objects: [
          { fileId: '123' },
        ],
      },
    ];

    return expect(waitForEncoding({ sequences, fileStore: mockFileStore }))
      .resolves.toEqual(expect.any(Object));
  });

  it('calls encodeFiles', () => {
    const sequences = [];

    return waitForEncoding({ sequences, fileStore: mockFileStore })
      .then(() => expect(mockFileStore.encodeFiles).toHaveBeenCalledTimes(1));
  });

  it('rejects if encoding fails for some files', () => {
    const sequences = [];

    mockFileStore.encodeFiles.mockResolvedValueOnce({
      result: [
        { success: true },
        { success: false, error: 'mock error' },
      ],
    });

    return expect(waitForEncoding({ sequences, fileStore: mockFileStore }))
      .rejects.toEqual(expect.any(Error));
  });

  it('returns a files object and passes through other args', () => {
    const sequences = [];

    return waitForEncoding({ sequences, fileStore: mockFileStore, mockArg: 'mockArg' })
      .then((result) => {
        expect(result.files).toEqual(expect.any(Object));
        expect(result.mockArg).toEqual('mockArg');
        expect(result.sequences).toEqual(expect.any(Array));
      });
  });
});
