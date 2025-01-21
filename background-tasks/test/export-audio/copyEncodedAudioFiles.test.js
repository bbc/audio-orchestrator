import { createRequire } from 'node:module';
import { jest } from '@jest/globals';

const require = createRequire(import.meta.url);

jest.mock('fs-extra', () => ({
  emptyDir: jest.fn(() => Promise.resolve()),
  ensureDir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn((dest, contents, cb) => (cb ? cb() : Promise.resolve())),
  copy: jest.fn((source, dest, options, cb) => (cb ? cb() : Promise.resolve())),
}));

jest.unstable_mockModule('../../src/export-audio/generateSequenceMetadata.js', () => ({ default: jest.fn() }));
jest.unstable_mockModule('../../src/export-audio/dashManifests.js', () => ({
  headerlessDashManifest: jest.fn(),
  safariDashManifest: jest.fn(),
}));

const { default: copyEncodedAudioFiles } = await import('../../src/export-audio/copyEncodedAudioFiles.js');
const { default: generateSequenceMetadata } = await import('../../src/export-audio/generateSequenceMetadata.js');

const fse = require('fs-extra');

const {
  headerlessDashManifest,
  safariDashManifest,
} = await import('../../src/export-audio/dashManifests.js');

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

const sequences = [
  {
    sequenceId: 'sequence-1',
    objects: [
      { fileId: 'file-1' },
      { fileId: 'file-2' },
    ],
  },
];

const fileStore = ({
  getFile: () => ({ probe: { sampleRate: 44100 } }),
});

const settings = {};

const files = {
  'file-1': {
    encodedItemsBasePath: '/dev/null/file-1',
    encodedItems: [
      {
        type: 'dash',
        relativePath: '',
        relativePathSafari: '',
      },
      {
        type: 'buffer',
        relativePath: '',
        relativePathSafari: '',
      },
    ],
  },
  'file-2': { encodedItems: [] },
};

const outputDir = '/dev/null';

describe('copyEncodedAudioFiles', () => {
  it('returns a promise', () => expect(
    copyEncodedAudioFiles({
      sequences, settings, files, outputDir, fileStore,
    }),
  ).resolves.toEqual(expect.anything()));

  it('generates dash and safari manifests', () => copyEncodedAudioFiles({
    sequences, settings, files, outputDir, fileStore,
  })
    .then(() => {
      expect(headerlessDashManifest).toHaveBeenCalledTimes(1);
      expect(safariDashManifest).toHaveBeenCalledTimes(1);
    }));

  it('calls copy once per item', () => copyEncodedAudioFiles({
    sequences, settings, files, outputDir, fileStore,
  })
    .then(() => {
      expect(fse.copy).toHaveBeenCalledTimes(2);
    }));

  it('generates a seqeunce metadata file', () => copyEncodedAudioFiles({
    sequences, settings, files, outputDir, fileStore,
  })
    .then(() => {
      expect(generateSequenceMetadata).toHaveBeenCalledTimes(1);
    }));
});
