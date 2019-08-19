import processFiles from '../processFiles';
import worker from './worker';

/**
 */
const detectItems = (
  { fileIds }, fileStore, onProgress,
) => processFiles(fileStore, worker, fileIds, null, onProgress);

export default detectItems;
