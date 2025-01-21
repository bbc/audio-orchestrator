import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/runExportSteps.js', () => ({ default: jest.fn((steps, args) => Promise.resolve(args)) }));

const { default: exportPreview } = await import('../../src/export-preview/index.js');

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
