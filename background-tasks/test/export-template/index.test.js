import exportTemplate from '../../src/export-template';
import runExportSteps from '../../src/runExportSteps';

jest.mock('../../src/runExportSteps', () => jest.fn((steps, args) => Promise.resolve(args)));

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
}));

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
