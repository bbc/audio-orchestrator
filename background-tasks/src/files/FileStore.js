/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import path from 'path';
import processFiles from './processFiles.js';
import AudioFile from './AudioFile.js';
import ImageFile from './ImageFile.js';

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
    if (!filePath || !path.isAbsolute(filePath)) {
      // TODO at least log a warning here - the file will be marked as missing because the path may
      // not exist anyway. Most likely this is because it was an absolute path on a different
      // platform (e.g. starting with 'C:\' instead of '/').

      throw new Error(`File ${fileId} does not have an absolute path.`);
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
      files,
      onProgress,
    );
  }

  encodeFiles(files, onProgress) {
    return processFiles(
      ({
        fileId, encodedItems, encodedItemsBasePath,
      }) => this.getFile(fileId).encode(encodedItems, encodedItemsBasePath),
      files,
      onProgress,
    );
  }
}

export default FileStore;
