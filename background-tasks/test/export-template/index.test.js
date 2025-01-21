import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/runExportSteps.js', () => ({
  default: jest.fn((steps, args) => Promise.resolve(args)),
}));

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
}));

const { default: exportTemplate } = await import('../../src/export-template/index.js');
const { default: runExportSteps } = await import('../../src/runExportSteps.js');

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('export-template', () => {
  it('returns a promise passing through the initial arguments', () => {
    const mockOutputDir = '/dev/null';

    const args = { outputDir: mockOutputDir };
    return exportTemplate(args)
      .then(({ result }) => {
        expect(runExportSteps).toHaveBeenCalledWith(
          expect.any(Array),
          args,
          expect.any(Function),
        );

        expect(result).toEqual({
          outputDir: mockOutputDir,
        });
      });
  });
});
