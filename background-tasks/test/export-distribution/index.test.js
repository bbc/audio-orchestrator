import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/runExportSteps.js', () => ({
  default: jest.fn((steps, args) => Promise.resolve(args)),
}));

const { default: exportDistribution } = await import('../../src/export-distribution/index.js');

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
