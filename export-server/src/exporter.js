import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import uuidv4 from 'uuid/v4';
import os from 'os';
import path from 'path';
import fse from 'fs-extra';
import queue from 'async/queue';

import audioWorker from './workers/audioWorker';
import templateWorker from './workers/templateWorker';
import distributionWorker from './workers/distributionWorker';
import previewWorker from './workers/previewWorker';

// How many tasks can be in progress at the same time
const CONCURRENCY = 1;

/**
 * Given the _tasks_ objects, create a worker that wraps the task method and captures its progress,
 * result, and errors. Calls the callback (to signal completion to async library) when completed or
 * failed.
 */
const getExportWorker = tasks => ({ worker, args, taskId }, callback) => {
  // Don't do anything if the task does not exist; it might have been cancelled.
  if (!(taskId in tasks)) {
    callback();
    return;
  }

  const task = tasks[taskId];

  // create a temporary directory to use as outputDir,
  // then pass this and the original arguments to the worker method along with a progress callback,
  // catch any errors thrown in the worker to mark the task as failed,
  // and return the result if it completes.
  fse.mkdtemp(path.join(os.tmpdir(), 'bbcat-orchestration-'))
    .then((outputDir) => {
      task.outputDir = outputDir;
    })
    .then(() => worker(
      { ...args, outputDir: task.outputDir },
      ({ completed, total, currentStep }) => {
        task.completed = completed;
        task.total = total;
        task.currentStep = currentStep;
      },
    ))
    .then(({ result, url, stopPreview }) => {
      task.result = result;
      if (stopPreview) {
        task.stopPreview = stopPreview;
      }
      if (url) {
        task.url = url;
      }
    })
    .catch((err) => {
      // TODO only pass on AudioWorkerValidationError, throw others?
      logger.debug(`Error caught in exporter, passing on to clients: ${err.message}`);

      task.error = err.message;
      if (err.missingEncodedItems) {
        task.missingEncodedItems = err.missingEncodedItems;
      }
    })
    .then(() => callback());
};

class Exporter {
  constructor() {
    this.tasks = {};
    this.queue = queue(getExportWorker(this.tasks), CONCURRENCY);
  }

  /**
   * Check that all sequences are valid, collect all the encoded files, and generate sequence
   * metadata files. Wrap all this in an asynchronous task that can be polled for progress.
   *
   * Checks that:
   *
   * - all sequences have objects;
   * - all objects have a file;
   * - all referenced files have encodedItems; and
   * - all encodedItems files still exist.
   *
   * Then:
   *
   * - generates safe names for all sequences;
   * - copies all encodedItems audio files into a new temporary directory structure; and
   * - generates a sequence.json metadata file for each sequence stored in the sequence folder.
   *
   * If successful, the result will contain:
   *
   * - the path to the temporary structure (basePath),
   * - a list of relative paths to all the generated sequence.json files, and
   * - the relative paths to the sequence.json files for the intro and main sequences if used.
   *
   * If any of the checks failed, the result will contain the error flag, and lists of:
   *
   * - required sequences without objects (sequenceId)
   * - objects without associated files (sequenceId and objectId)
   * - missing encoded files (sequenceId and fileId), so the client can trigger encoding again.
   *
   * @param {Array<Object>} sequences, each sequence should contain a name, a list of objects, a
   * list of files, and the optional isMain or isIntro flags.
   *
   * @return {Promise<Object>} { taskId }
   */
  exportAudio(sequences) {
    const taskId = uuidv4();

    this.tasks[taskId] = {};

    this.queue.push({
      worker: audioWorker,
      taskId,
      args: {
        sequences,
      },
    });

    return Promise.resolve({ taskId });
  }

  /**
   * Does everything @link{exportAudio} would do, and combines its results with the customised
   * template files, returning a path to the temporary source folder. Wraps all this in a task
   * that can be polled for progress.
   *
   * It:
   *
   * - runs the audio export (@link{exportAudio}),
   * - copies the template files to a temporary folder,
   * - adds the settings and the paths to the sequence.json files to config.js, and
   * - replaces the content of certain tags and files with customisation options in the project
   *   settings, if applicable.
   *
   * If successful, the result contains:
   *
   * - the path to the temporary directory containing the adapted template source code and audio
   *   and metadata files.
   *
   * If there is an error in the audio export, it is passed on. If there is an error in the
   * template export, an error message will be included.
   *
   * @param {Array<Object>} sequences, each sequence should contain a name, a list of objects, a
   * list of files, and the optional isMain or isIntro flags.
   * @param {Object} settings, the project settings used to populate the template files.
   *
   * @return {Promise<Object>} { taskId }
   */
  exportTemplate(sequences, settings) {
    const taskId = uuidv4();

    this.tasks[taskId] = {};

    this.queue.push({
      worker: templateWorker,
      taskId,
      args: {
        sequences,
        settings,
      },
    });

    return Promise.resolve({ taskId });
  }

  /**
   * Runs the same tasks as @link{exportAudio} and @link{exportTemplate}, then compiles the source
   * code into a static distribution ready to be deployed to a web server. Wraps this in a task
   * that can be polled for progress.
   *
   * It:
   *
   * - runs the template export (@link{exportTemplate}) which includes the audio export
   *   (@link{exportAudio}),
   * - links or copies the relevant node_modules into the resulting source folder,
   * - runs webpack to create the distribution folder,
   * - moves the distribution folder to a new temporary path, and
   * - removes the temporary source folder.
   *
   * @param {Array<Object>} sequences, each sequence should contain a name, a list of objects, a
   * list of files, and the optional isMain or isIntro flags.
   * @param {Object} settings, the project settings used to populate the template files.
   *
   * @return {Promise<Object>} { taskId }
   */
  exportDistribution(sequences, settings) {
    const taskId = uuidv4();

    this.tasks[taskId] = {};

    this.queue.push({
      worker: distributionWorker,
      taskId,
      args: {
        sequences,
        settings,
      },
    });

    return Promise.resolve({ taskId });
  }

  /**
   * Runs the same tasks as @link{exportDistribution} (with a modified settings object),
   * then starts a preview web server serving the output directory.
   *
   * It:
   *
   * - runs the distribution export (@link{exportDistribution})
   *
   * It will also register a call back so that when task is cancelled, it:
   *
   * - stops the webserver, and
   * - removes the temporary distribution folder.
   *
   * @param {Array<Object>} sequences, each sequence should contain a name, a list of objects, a
   * list of files, and the optional isMain or isIntro flags.
   * @param {Object} settings, the project settings used to populate the template files.
   *
   * @return {Promise<Object>} { taskId }
   */
  exportPreview(sequences, settings) {
    const taskId = uuidv4();

    this.tasks[taskId] = {};

    this.queue.push({
      worker: previewWorker,
      taskId,
      args: {
        sequences,
        settings,
      },
    });

    return Promise.resolve({ taskId });
  }

  /**
   * Returns status information about the task, like the current step label and the number of steps
   * completed and remaining. Includes a result object if the task is completed or has failed.
   *
   * @param {string} taskId
   *
   * @returns {Object}
   */
  getTask(taskId) {
    // Check that the task actually exists
    if (!(taskId in this.tasks)) {
      return Promise.reject(new Error('No such task'));
    }

    // Get task information to return
    const task = this.tasks[taskId];
    return Promise.resolve({
      error: task.error,
      completed: task.completed,
      total: task.total,
      currentStep: task.currentStep,
      result: {
        outputDir: (task.completed !== task.total) ? null : task.outputDir,
        missingEncodedItems: task.missingEncodedItems || [],
        url: task.url || null,
      },
    });
  }

  /**
   * Deletes a task and its working directory, if set. Stops the preview server if it exists.
   *
   * @param {string} taskId
   *
   * @returns {Promise}
   */
  deleteTask(taskId) {
    // Check that the task actually exists
    if (!(taskId in this.tasks)) {
      return Promise.reject(new Error('No such task'));
    }

    const task = this.tasks[taskId];

    return Promise.resolve()
      .then(() => (task.stopPreview ? task.stopPreview() : null))
      .then(() => (task.outputDir ? fse.remove(task.outputDir) : null))
      .then(() => {
        delete this.tasks[taskId];
      });
  }
}

export default Exporter;
