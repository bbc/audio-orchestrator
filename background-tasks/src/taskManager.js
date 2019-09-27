import queue from 'async/queue';
import uuidv4 from 'uuid/v4';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('task-manager');

/**
 * Sets the concurrency of the async queue, if greater than 1, tasks will be processed
 * concurrently.
 */
const CONCURRENCY = 4;

/**
 * Returns a function that takes a { worker, args, taskId } object and a callback, runs the
 * worker function with the args (adding fileStore) and onProgress arguments, captures its progress,
 * and waits for its completion (or error) before calling the callback.
 * This function is executed asynchronously for every object added to the taskQueue.
 */
const createWorker = (tasks, fileStore) => ({ worker, args, taskId }, callback) => {
  if (!(taskId in tasks)) {
    callback();
    return;
  }

  // get the task object to modify on progress and completion
  const task = tasks[taskId];

  // create an onProgress handler to pass to the worker function
  const onProgress = ({ completed, total, currentStep }) => {
    logger.silly(`${taskId}:\t\t${(completed || 0).toFixed(2)} / ${total}\t(${currentStep})`);
    task.completed = completed;
    task.total = total;
    task.currentStep = currentStep;
  };

  logger.debug(`Starting task ${taskId}.`);
  worker({ ...args, fileStore }, onProgress)
    .then(({ result, onCancel }) => {
      logger.debug(`Task ${taskId} completed.`);
      task.result = result;
      task.onCancel = onCancel;
    })
    .catch((err) => {
      logger.error('Error in worker, passing on to clients.', err);
      task.error = err.message;
    })
    .then(() => callback());
};

/**
 * @class
 *
 * The TaskManager maintains the runtime state of the task queue and the cached results of per-file
 * operations. Tasks are completed asynchronously, and potentially in parallel according to the
 * CONCURRENCY setting. Task status and results can be retrieved at any time using the taskId
 * returned when the task was created.
 */
class TaskManager {
  constructor(fileStore) {
    this.tasks = {};
    this.fileStore = fileStore;
    this.taskQueue = queue(createWorker(this.tasks, this.fileStore), CONCURRENCY);
  }

  /**
   * Creates a task based on the given function and arguments, and returns its taskId in a promise.
   *
   * @param {function} worker
   * @param {object} args
   *
   * @returns {Promise}
   */
  createTask(worker, args) {
    const taskId = uuidv4();

    this.tasks[taskId] = {};

    this.taskQueue.push({
      worker,
      args,
      taskId,
    });

    return Promise.resolve({ taskId });
  }

  /**
   * Gets the task's progress, error, and result data, if available.
   * Throws an error if the task does not exist.
   *
   * @param {string} taskId
   *
   * @returns {Promise}
   */
  getTask(taskId) {
    // Ensure the task exists.
    const task = this.tasks[taskId];
    if (!task) {
      throw new Error('No such task.');
    }

    const {
      error,
      result,
      currentStep,
      completed,
      total,
    } = task;

    return Promise.resolve({
      error,
      result,
      currentStep,
      completed,
      total,
    });
  }

  /**
   * Removes a task, cancelling it if it hasn't yet started processing.
   *
   * @param {string} taskId
   *
   * @returns {Promise}
   */
  cancelTask(taskId) {
    const task = this.tasks[taskId];

    // If the task does not exist, it may already have been cancelled, return a successful response.
    if (!task) {
      return Promise.resolve();
    }

    logger.debug(`Cancelling task ${taskId}.`);

    // If a cancel callback is set, call it.
    const { onCancel } = task;
    if (onCancel) {
      onCancel();
    }

    // Remove the reference to the task, so that any pending workers it will skip it.
    delete this.tasks[taskId];

    return Promise.resolve();
  }
}

export default TaskManager;
