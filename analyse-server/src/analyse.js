import { analyseLogger as logger } from 'bbcat-orchestration-builder-logging';
import { promisify } from 'util';
import { mkdtemp as mkdtempCB } from 'fs';
import os from 'os';
import path from 'path';
import uuidv4 from 'uuid/v4';
import priorityQueue from 'async/priorityQueue';
import processExists from './workers/exists';
import processProbe from './workers/probe';
import processItems from './workers/items';
import processEncode from './workers/encode';

const mkdtemp = promisify(mkdtempCB);

// how many tasks can be in progress at the same time
const CONCURRENCY = 4;

// task workers
const tasks = {
  EXISTS: processExists,
  PROBE: processProbe,
  ITEMS: processItems,
  ENCODE: processEncode,
};

// task priorities, tasks are processed in ascending order
const priorities = {
  EXISTS: 10,
  PROBE: 20,
  ITEMS: 30,
  ENCODE: 40,
};

/**
 * Binds the worker method to the given files and batches objects.
 *
 * Returns a function that processes one { task, batchId, fileId } it is given, updates the files
 * and batches objects with the results, and calls the callback when finished.
 */
const getAnalysisWorker = (files, batches) => ({
  task,
  fileId,
  args,
  batchId,
}, callback) => {
  // Don't do anything if the batch does not exist - it may have been cancelled.
  if (!(batchId in batches)) {
    callback();
    return;
  }

  // Immediately save a non-successful result if the file has not been registered.
  if (!(fileId in files)) {
    logger.warn(`fileId not registered: ${fileId}`);
    batches[batchId].results.push({ fileId, success: false });

    callback();
    return;
  }

  // process the actual task, then store the result and success flag, only then call the callback.
  task(files[fileId].path, args)
    .then((result) => {
      const batch = batches[batchId];
      if (batch) {
        batch.results.push({ fileId, success: true, ...result });
      }
    })
    .catch((err) => {
      const batch = batches[batchId];
      if (batch) {
        logger.warn('worker task failed:', err);
        batch.results.push({ fileId, success: false });
      }
    })
    .then(() => callback());
};

class Analyser {
  constructor() {
    this.files = {}; // data about each file, including internal info and analysis results.
    this.batches = {};
    this.filePathToId = {}; // a map of all paths to their fileId for lookup by path.
    this.fileIds = []; // list of all fileIds assigned for iteration.

    this.queue = priorityQueue(getAnalysisWorker(this.files, this.batches), CONCURRENCY);
  }

  /**
   * Initialise a batch of given total length, creating a unique id for it and registering it.
   *
   * Batches do not hold any information about the files they will be processing. Results are added
   * one at a time as they become available, each at least providing a fileId and a success flag.
   * The actual results are available in the item's properties, e.g. results[0].probe etc.
   *
   * @private
   */
  initialiseBatch(total) {
    const batch = {
      batchId: uuidv4(),
      results: [],
      total,
    };
    this.batches[batch.batchId] = batch;

    return batch;
  }

  /**
   * Create a bunch of files, storing their normalised path against the given file id, and
   * triggering a check for their accessibility on the file system.
   *
   * @returns {Promise}
   */
  batchCreate(files) {
    const batch = this.initialiseBatch(files.length);
    const { batchId } = batch;

    files.forEach((file) => {
      const { fileId } = file;
      const filePath = file.path;

      if (!path.isAbsolute(filePath)) {
        throw new Error('Not an absolute path');
      }

      this.files[file.fileId] = {
        fileId,
        path: path.normalize(filePath),
      };

      this.queue.push(
        {
          task: tasks.EXISTS,
          fileId,
          batchId,
        },
        priorities.EXISTS,
      );
    });

    return Promise.resolve({ batchId });
  }

  /**
   * Probe for audio stream information in a batch of previously created files.
   *
   * @returns {Promise}
   */
  batchProbe(fileIds) {
    const batch = this.initialiseBatch(fileIds.length);
    const { batchId } = batch;

    fileIds.forEach((fileId) => {
      this.queue.push(
        {
          task: tasks.PROBE,
          fileId,
          batchId,
        },
        priorities.PROBE,
      );
    });

    return Promise.resolve({ batchId });
  }

  /**
   * Analyse gaps in a batch of previously created files.
   *
   * @returns {Promise}
   */
  batchItems(fileIds) {
    const batch = this.initialiseBatch(fileIds.length);
    const { batchId } = batch;

    fileIds.forEach((fileId) => {
      this.queue.push(
        {
          task: tasks.ITEMS,
          fileId,
          batchId,
        },
        priorities.ITEMS,
      );
    });

    return Promise.resolve({ batchId });
  }

  /**
   * Encode the given files, based on their items split.
   *
   * @param {Array} files - an array of { fileId, item: { start, duration, type }, sequenceId }.
   *
   * @returns {Promise}
   */
  batchEncode(files, { baseUrl }) {
    // create a temporary directory first, to hold the resulting files
    return mkdtemp(path.join(os.tmpdir(), 'bbcat-orchestration-'))
      .then((encodedItemsBasePath) => {
        // now create the batch and a task for every input file
        const batch = this.initialiseBatch(files.length);
        const { batchId } = batch;

        files.forEach(({ fileId, items, sequenceId }) => {
          this.queue.push(
            {
              task: tasks.ENCODE,
              fileId,
              batchId,
              args: {
                items,
                encodedItemsBasePath,
                sequenceId,
                baseUrl,
              },
            },
            priorities.ENCODE,
          );
        });

        // resolve to the { batchId } as usual, once it has been created.
        return { batchId };
      });
  }

  /**
   * Get basic information about the batch progress.
   *
   * @returns {Promise}
   */
  getBatch(batchId) {
    return Promise.resolve().then(() => {
      if (!(batchId in this.batches)) {
        throw new Error('No such batch');
      }

      const { results, total } = this.batches[batchId];
      return { completed: results.length, total };
    });
  }

  /**
   * Get full results for the batch.
   *
   * @returns {Promise}
   */
  getBatchResults(batchId) {
    return Promise.resolve().then(() => {
      if (!(batchId in this.batches)) {
        throw new Error('No such batch');
      }

      const { results, total } = this.batches[batchId];
      return { completed: results.length, total, results };
    });
  }
}

export default Analyser;
