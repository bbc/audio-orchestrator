import mapLimit from 'async/mapLimit';
import path from 'path';
import { getLogger } from 'bbcat-orchestration-builder-logging';
import checkFileExists from './checkFileExists';
import probeFile from './probeFile';
import detectItems from './detectItems';
import encodeItems from './encodeItems';

const CONCURRENCY = 4;
const logger = getLogger('file-store');

/**
 * processes files in parallel calling the worker for each fileId, and returns a promise resolving
 * to an array of { fileId, success, ...result }.
 *
 * @param {function} worker
 * @param {Array<Object>} args
 * @param {function} onProgress
 *
 * @returns {Promise<Array<Object>>}
 */
const processFiles = (worker, args, onProgress) => {
  const total = args.length;
  let completed = 0;
  onProgress({ total, completed });

  logger.info(`Processing ${total} files with concurrency = ${CONCURRENCY}.`);

  return mapLimit(args, CONCURRENCY, (arg, cb) => {
    worker(arg)
      .then((result) => {
        // Return a successful response
        cb(null, { fileId: arg.fileId, success: true, ...result });
      })
      .catch((err) => {
        // Note, a per-file error in the worker is returned in the response, thus not actually
        // returning an error in the callback.
        cb(null, { fileId: arg.fileId, success: false, error: err.message });
      })
      .finally(() => {
        completed += 1;
        onProgress({ total, completed });
      });
  }).then(result => ({ result }));
};

/**
 * @class
 *
 * Stores information about a file and its location. Users are welcome to set other properties on
 * it.
 *
 * Call the Promise-returning methods exists, probe, detectItems, and encode to get cached and
 * validated results or to run that task on-demand.
 */
class AudioFile {
  constructor(fileId, filePath, { items, encodedItems } = {}) {
    this.fileId = fileId;
    this.filePath = filePath;
    this.fileName = path.basename(filePath);
    this.data = {
      items,
      encodedItems,
    };
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
      .then(() => probeFile(this.filePath))
      .then(({ probe }) => {
        this.data.probe = probe;
        return { probe };
      });

    return this.probePromise;
  }

  detectItems(cachedItems) {
    // Caller passed in cached items? Store them.
    if (cachedItems) {
      this.data.items = cachedItems;
    }

    // Have stored items already? Return immediately.
    if (this.data.items) {
      return Promise.resolve({ items: this.data.items });
    }

    // Task already in progress? Return promise for its result.
    if (this.detectItemsPromise) {
      return this.detectItemsPromise;
    }

    // Otherwise, check the original file still exists, run the probe check to get its duration,
    // run the items analysis, and then save and return the result.
    logger.debug(`Starting detectItems for ${this.fileName}`);
    this.detectItemsPromise = Promise.resolve()
      .then(() => this.exists())
      .then(() => this.runProbe())
      .then(({ probe }) => detectItems(this.filePath, probe.duration))
      .then(({ items }) => {
        this.data.items = items;
        return { items };
      });

    return this.detectItemsPromise;
  }

  encode(cachedEncodedItems, cachedEncodedItemsBasePath) {
    // If cached results are given, save those and check if they are still valid below.
    if (cachedEncodedItems && cachedEncodedItemsBasePath) {
      this.data.encodedItems = cachedEncodedItems;
      this.data.encodedItemsBasePath = cachedEncodedItemsBasePath;
    }

    // If encodedItems are already stored, check that they still exist before returning.
    if (this.data.encodedItems) {
      logger.debug(`Checking if previously stored encodedItemsBasePath for ${this.fileName} still exists.`);
      return checkFileExists(this.data.encodedItemsBasePath)
        .then(() => ({
          encodedItems: this.data.encodedItems,
          encodedItemsBasePath: this.data.encodedItemsBasePath,
        }))
        .catch(() => {
          // if there was an error, ie. the stored results don't exist anymore, clear them and try
          // to start encoding from scratch.
          this.data.encodedItems = null;
          this.data.encodedItemsBasePath = null;
          return this.encode();
        });
    }

    // If encoding is already in progress, just wait for it to finish and return those results.
    if (this.encodePromise) {
      return this.encodePromise;
    }

    // Check the original file still exist, and start the actual encoding.
    logger.debug(`Starting encoding for ${this.fileName}`);
    this.encodePromise = Promise.resolve()
      .then(() => this.exists())
      .then(() => this.detectItems())
      .then(({ items }) => encodeItems(this.filePath, items))
      .then(({ encodedItems, encodedItemsBasePath }) => {
        this.data.encodedItems = encodedItems;
        this.data.encodedItemsBasePath = encodedItemsBasePath;
        return { encodedItems, encodedItemsBasePath };
      });

    return this.encodePromise;
  }

  get probe() {
    return this.data.probe;
  }

  get items() {
    return this.data.items;
  }

  get encodedItems() {
    return this.data.encodedItems;
  }

  get encodedItemsBasePath() {
    return this.data.encodedItemsBasePath;
  }
}

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
