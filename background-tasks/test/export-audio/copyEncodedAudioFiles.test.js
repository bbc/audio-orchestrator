import fse from 'fs-extra';
import copyEncodedAudioFiles from '../../src/export-audio/copyEncodedAudioFiles';
import generateSequenceMetadata from '../../src/export-audio/generateSequenceMetadata';
import {
  headerlessDashManifest,
  safariDashManifest,
} from '../../src/export-audio/dashManifests';

jest.mock('fs-extra', () => ({
  emptyDir: jest.fn(() => Promise.resolve()),
  ensureDir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn((dest, contents, cb) => (cb ? cb() : Promise.resolve())),
  copy: jest.fn((source, dest, options, cb) => (cb ? cb() : Promise.resolve())),
}));

jest.mock('../../src/export-audio/generateSequenceMetadata');
jest.mock('../../src/export-audio/dashManifests');

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
      sequences, settings, files, outputDir,
    }),
  ).resolves.toEqual(expect.anything()));

  it('generates dash and safari manifests', () => {
    return copyEncodedAudioFiles({
      sequences, settings, files, outputDir,
    })
      .then(() => {
        expect(headerlessDashManifest).toHaveBeenCalledTimes(1);
        expect(safariDashManifest).toHaveBeenCalledTimes(1);
      });
  });

  it('calls copy once per item', () => {
    return copyEncodedAudioFiles({
      sequences, settings, files, outputDir,
    })
      .then(() => {
        expect(fse.copy).toHaveBeenCalledTimes(2);
      });
  });

  it('generates a seqeunce metadata file', () => {
    return copyEncodedAudioFiles({
      sequences, settings, files, outputDir,
    })
      .then(() => {
        expect(generateSequenceMetadata).toHaveBeenCalledTimes(1);
      });
  });
});
