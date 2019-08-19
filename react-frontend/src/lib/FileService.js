import BackgroundTasks from './BackgroundTasks';

/**
 * Immediately calls the progress and success callbacks, for when an empty list of tasks is used.
 *
 * @returns Promise
 */
const shortcutSuccess = ({ onProgress, onComplete } = {}) => {
  if (onProgress) onProgress({ completed: 0, total: 0 });
  if (onComplete) onComplete({ result: [] });

  return Promise.resolve();
};

/**
 * FileService class, wraps all interaction with the analyse, encode, and project build APIs.
 */
class FileService {
  constructor(apiBase) {
    this.runningTasks = [];
    this.tasks = new BackgroundTasks({ apiBase });
  }

  createTask(name, args, callbacks) {
    return this.tasks.createTask(name, args, callbacks)
      .then((taskId) => {
        this.runningTasks.push(taskId);
        return taskId;
      });
  }

  /**
   * Create a bunch of files at once, and provide progress updates. Resolve the returned promise
   * when the request has been sent and accepted by the server.
   *
   * @param {Array<Object>} files - files to create, each a { fileId, path } object.
   */
  createAll(files, callbacks = {}) {
    if (files.length === 0) {
      return shortcutSuccess(callbacks);
    }

    return this.createTask('analyse/create', { files }, callbacks);
  }

  /**
   * Probe previously created files and provide progress updates.
   *
   * @param {Array<String>} fileIds
   */
  probeAll(fileIds, callbacks = {}) {
    if (fileIds.length === 0) {
      return shortcutSuccess(callbacks);
    }

    return this.createTask('analyse/probe', { fileIds }, callbacks);
  }

  /**
   * Analyse a bunch of files for silence, returning the start times and durations for the items
   * between the gaps.
   *
   * @param {Array<Object>} fileIds - list of previously created fileIds.
   */
  itemsAll(fileIds, callbacks = {}) {
    if (fileIds.length === 0) {
      return shortcutSuccess(callbacks);
    }

    return this.createTask('analyse/items', { fileIds }, callbacks);
  }

  /**
   * Encode a bunch of files using the items information.
   *
   * @param {Object} options
   * @param {Array<Object>} options.files - of shape { fileId, path, items, sequenceId }.
   *
   */
  encodeAll({ files }, callbacks = {}) {
    if (files.length === 0) {
      return shortcutSuccess(callbacks);
    }

    return this.createTask('analyse/encode', { files }, callbacks);
  }
}

export default FileService;
