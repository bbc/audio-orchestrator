import checkSequencesAreValid from '../../src/export-audio/checkSequencesAreValid';

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

const validSequence = {
  objects: [
    { fileId: 'foo' },
  ],
};

describe('checkSequencesAreValid', () => {
  it('completes without error if there are no sequences.', () => expect(
    Promise.resolve().then(() => checkSequencesAreValid({
      sequences: [],
    })),
  ).resolves.toEqual(expect.any(Object)));

  it('completes without error if the sequence are valid.', () => expect(
    Promise.resolve().then(() => checkSequencesAreValid({
      sequences: [validSequence],
    })),
  ).resolves.toEqual(expect.any(Object)));

  it('throws an error if a sequence has no objects', () => {
    const invalidSequence = {
      objects: [],
    };

    const sequences = [
      validSequence,
      invalidSequence,
    ];

    return expect(() => checkSequencesAreValid({ sequences })).toThrow('have objects');
  });

  it('throws an error if an object has no file', () => {
    const invalidSequence = {
      objects: [
        { fileId: '123' },
        {},
      ],
    };

    const sequences = [
      invalidSequence,
      validSequence,
    ];

    return expect(() => checkSequencesAreValid({ sequences })).toThrow('have an audio file');
  });

  it('passes through other arguments', () => {
    const mockArg = {};
    const sequences = [validSequence];
    const result = checkSequencesAreValid({ sequences, mockArg });

    expect(result.mockArg).toBe(mockArg);
    expect(result.sequences).toBe(sequences);
  });
});
