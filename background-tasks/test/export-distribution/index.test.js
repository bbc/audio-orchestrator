import exportDistribution from '../../src/export-distribution';

jest.mock('../../src/runExportSteps', () => jest.fn((steps, args) => Promise.resolve(args)));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('export-distribution', () => {
  it('returns a promise passing through the initial arguments', () => {
    const mockOutputDir = '/dev/null';

    return exportDistribution(
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
