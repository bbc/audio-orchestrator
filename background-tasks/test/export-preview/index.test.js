import exportPreview from '../../src/export-preview';

jest.mock('../../src/runExportSteps', () => jest.fn((steps, args) => Promise.resolve(args)));

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('export-preview', () => {
  it('returns a promise passing through the initial arguments', () => Promise.resolve()
    .then(() => exportPreview(
      {
        previewUrl: '',
        stopPreview: () => {},
      },
      () => {},
    ))
    .then(({ result, onCancel }) => {
      expect(result).toEqual({
        url: expect.any(String),
      });
      expect(onCancel).toEqual(expect.any(Function));
    }));
});
