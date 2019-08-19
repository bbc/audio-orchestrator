import processFiles from '../processFiles';
import worker from './worker';

/**
 * Creates empty file entries in the file store, this is required before other file operations can
 * be called. Then checks that the files actually exist.
 */
const probeFiles = (
  { fileIds }, fileStore, onProgress,
) => processFiles(fileStore, worker, fileIds, null, onProgress);

export default probeFiles;
