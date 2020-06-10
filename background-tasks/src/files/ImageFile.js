import path from 'path';
import { getLogger } from 'bbcat-orchestration-builder-logging';

import checkFileExists from './checkFileExists';
import probeImageFile from './probeImageFile';

const logger = getLogger('image-file');

/**
 * @class
 *
 * Stores information about a file and its location. Users are welcome to set other properties on
 * it.
 *
 * Call the Promise-returning methods exists, probe, detectItems, and encode to get cached and
 * validated results or to run that task on-demand.
 */
class ImageFile {
  constructor(fileId, filePath) {
    this.fileId = fileId;
    this.filePath = filePath;
    this.fileName = path.basename(filePath);
    this.data = {};
  }

  exists() {
    return checkFileExists(this.filePath);
  }

  runProbe() {
    // if probe data is already stored, return immediately.
    if (this.data.probe) {
      return Promise.resolve({ probe: this.data.probe });
    }

    // if probe task is in progress, return promise for its result.
    if (this.probePromise) {
      return this.probePromise;
    }

    // otherwise, actually run the probe, after checking that the file exists.
    logger.debug(`Running probe for ${this.fileName}`);
    this.probePromise = Promise.resolve()
      .then(() => this.exists())
      .then(() => probeImageFile(this.filePath))
      .then(({ probe }) => {
        this.data.probe = probe;
        return { probe };
      });

    return this.probePromise;
  }

  get probe() {
    return this.data.probe;
  }
}

export default ImageFile;
