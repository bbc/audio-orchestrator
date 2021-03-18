import path from 'path';
import processFiles from './processFiles';
import AudioFile from './AudioFile';
import ImageFile from './ImageFile';

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

  registerFile(fileId, filePath, fileType = 'audio') {
    if (!path.isAbsolute(filePath)) {
      // TODO at least log a warning here - the file will be marked as missing because the path may
      // not exist anyway. Most likely this is because it was an absolute path on a different
      // platform (e.g. starting with 'C:\' instead of '/').

      // throw new Error(`File ${fileId} does not have an absolute path.`);
    }

    // Create the file object.
    // If the file was already registered, it will be replaced (and previous results discarded).
    const normalizedPath = path.normalize(filePath);
    if (fileType === 'audio') {
      this.files[fileId] = new AudioFile(fileId, normalizedPath);
    } else if (fileType === 'image') {
      this.files[fileId] = new ImageFile(fileId, normalizedPath);
    } else {
      throw new Error(`Unknown file type ${fileType}`);
    }
  }

  registerFiles(files, onProgress) {
    // 1. Register each file with the store.
    // 2. check that all the new files actually exist.
    return Promise.resolve()
      .then(() => {
        files.forEach((file) => {
          this.registerFile(file.fileId, file.path, file.type);
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
