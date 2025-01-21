import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/runExportSteps.js', () => ({
  default: jest.fn((steps, args) => Promise.resolve(args)),
}));

const { default: exportAudio } = await import('../../src/export-audio/index.js');

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
