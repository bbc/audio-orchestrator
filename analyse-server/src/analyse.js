import uuidv4 from 'uuid/v4';
import priorityQueue from 'async/priorityQueue';
import path from 'path';
import { processExists, processProbe, processSilence } from './workers';

// how many tasks can be in progress at the same time
const CONCURRENCY = 4;

// task workers
const tasks = {
  EXISTS: processExists,
  PROBE: processProbe,
  SILENCE: processSilence,
};

// task priorities, tasks are processed in ascending order
const priorities = {
  EXISTS: 10,
  PROBE: 20,
  SILENCE: 30,
};

/**
 * Binds the worker method to the given files and batches objects.
 *
 * Returns a function that processes one { task, batchId, fileId } it is given, updates the files
 * and batches objects with the results, and calls the callback when finished.
 */
const getAnalysisWorker = (files, batches) => ({ task, fileId, batchId }, callback) => {
  // Don't do anything if the batch does not exist - it may have been cancelled.
  if (!(batchId in batches)) {
    callback();
    return;
  }

  // Immediately save a non-successful result if the file has not been registered.
  if (!(fileId in files)) {
    console.error(`fileId not registered: ${fileId}`);
    batches[batchId].results.push({ fileId, success: false });

    callback();
    return;
  }

  // process the actual task, then store the result and success flag, only then call the callback.
  task(files[fileId].path)
    .then((result) => {
      const batch = batches[batchId];
      if (batch) {
        batch.results.push({ fileId, success: true, ...result });
      }
    })
    .catch((err) => {
      const batch = batches[batchId];
      if (batch) {
        console.error('worker task failed:', err);
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
   * Analyse silence in a batch of previously created files.
   *
   * @returns {Promise}
   */
  batchSilence(fileIds) {
    const batch = this.initialiseBatch(fileIds.length);
    const { batchId } = batch;

    fileIds.forEach((fileId) => {
      this.queue.push(
        {
          task: tasks.SILENCE,
          fileId,
          batchId,
        },
        priorities.SILENCE,
      );
    });

    return Promise.resolve({ batchId });
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
