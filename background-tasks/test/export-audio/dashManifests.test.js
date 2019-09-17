import {
  dashManifest,
  safariDashManifest,
  headerlessDashManifest,
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

  describe('headerlessDashManifest', () => {
    it('does not generate any NaN or undefined values in the manifest', () => {
      const result = headerlessDashManifest('foo', '/audio/bar', 60, 44100, 'foo_bar_%05d');

      expect(result).not.toEqual(expect.stringContaining('NaN'));
      expect(result).not.toEqual(expect.stringContaining('undefined'));
      expect(result).not.toEqual(expect.stringContaining('=""'));
    });
  });

  describe('safariDashManifest', () => {
    it('does not generate any NaN or undefined values in the manifest', () => {
      const result = safariDashManifest('foo', '/audio/bar', 60, 44100, 'foo_bar_%05d');

      expect(result).not.toEqual(expect.stringContaining('NaN'));
      expect(result).not.toEqual(expect.stringContaining('undefined'));
      expect(result).not.toEqual(expect.stringContaining('=""'));
    });
  });
});
