import path from 'path';
import processFiles from './processFiles';
import AudioFile from './AudioFile';

/**
 * @class
 *
 * Stores information about files and their location on he file system. Does not store any file
 * contents itself.
 */
class FileStore {
  constructor() {
    this.files = {};
  }

  getFile(fileId) {
    if (!(fileId in this.files)) {
      throw new Error(`File ${fileId} was not registered with the file store.`);
    }

    return this.files[fileId];
  }

  registerFile(fileId, filePath) {
    // Check the file has an absolute path.
    if (!path.isAbsolute(filePath)) {
      throw new Error(`File ${fileId} does not have an absolute path.`);
    }

    // Create the file object.
    // If the file was already registered, it will be replaced (and previous results discarded).
    this.files[fileId] = new AudioFile(fileId, path.normalize(filePath));
  }

  registerFiles(files, onProgress) {
    // 1. Register each file with the store.
    // 2. check that all the new files actually exist.
    return Promise.resolve()
      .then(() => {
        files.forEach((file) => {
          this.registerFile(file.fileId, file.path);
        });
      })
      .then(() => processFiles(({ fileId }) => this.getFile(fileId).exists(), files, onProgress));
  }

  probeFiles(files, onProgress) {
    return processFiles(({ fileId }) => this.getFile(fileId).runProbe(), files, onProgress);
  }

  detectItems(files, onProgress) {
    return processFiles(
      ({ fileId, items }) => this.getFile(fileId).detectItems(items),
      files, onProgress,
    );
  }

  encodeFiles(files, onProgress) {
    return processFiles(
      ({
        fileId, encodedItems, encodedItemsBasePath,
      }) => this.getFile(fileId).encode(encodedItems, encodedItemsBasePath),
      files, onProgress,
    );
  }
}

export default FileStore;
