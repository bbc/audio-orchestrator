import exportAudio from '../../src/export-audio';

jest.mock('../../src/runExportSteps', () => jest.fn((steps, args) => Promise.resolve(args)));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('export-audio', () => {
  it('returns a promise passing through the initial arguments', () => {
    const mockOutputDir = '/dev/null';

    return exportAudio(
      {
        outputDir: mockOutputDir,
      },
      () => {},
    ).then(({ result }) => {
      expect(result).toEqual({
        outputDir: mockOutputDir,
      });
    });
  });
});
