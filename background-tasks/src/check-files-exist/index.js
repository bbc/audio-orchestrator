import path from 'path';
import processFiles from '../processFiles';
import worker from './worker';

/**
 * Creates empty file entries in the file store, this is required before other file operations can
 * be called. Then checks that the files actually exist.
 */
const checkFilesExist = ({ files }, fileStore, onProgress) => {
  // Create files in the store
  files.forEach((file) => {
    if (!path.isAbsolute(file.path)) {
      throw new Error('Not an absolute path.');
    }

    // TODO store could be a class, and a method on it could be used instead of direct assignment.
    // eslint-disable-next-line no-param-reassign
    fileStore[file.fileId] = {
      filePath: path.normalize(file.path),
    };
  });

  // actually process the files
  const fileIds = files.map(({ fileId }) => fileId);
  return processFiles(fileStore, worker, fileIds, null, onProgress);
};

export default checkFilesExist;
