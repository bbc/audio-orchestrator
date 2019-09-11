import {
  dashManifest,
} from '../../src/export-audio/dashManifests';

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('dashManifests', () => {
  describe('dashManifest', () => {
    it('returns an xml document', () => {
      const result = dashManifest();
      expect(result).toEqual(expect.stringContaining('<?xml'));
    });
  });
});
