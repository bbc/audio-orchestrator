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

import BackgroundTasks from './BackgroundTasks.js';

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
  registerAll(files, callbacks = {}) {
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
  probeAll(files, callbacks = {}) {
    if (files.length === 0) {
      return shortcutSuccess(callbacks);
    }

    return this.createTask('analyse/probe', { files }, callbacks);
  }

  /**
   * Analyse a bunch of files for silence, returning the start times and durations for the items
   * between the gaps.
   *
   * @param {Array<Object>} fileIds - list of previously created fileIds.
   */
  itemsAll(files, callbacks = {}) {
    if (files.length === 0) {
      return shortcutSuccess(callbacks);
    }

    return this.createTask('analyse/items', { files }, callbacks);
  }

  /**
   * Encode a bunch of files using the items information.
   *
   * @param {Array<Object>} files - of shape { fileId, encodedItems, encodedItemsBasePath }.
   *
   */
  encodeAll(files, callbacks = {}) {
    if (files.length === 0) {
      return shortcutSuccess(callbacks);
    }

    return this.createTask('analyse/encode', { files }, callbacks);
  }
}

export default FileService;
