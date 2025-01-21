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
 * ExportService class, wraps all interaction with the analyse, encode, and project build APIs.
 */
class ExportService {
  constructor() {
    this.runningTasks = [];
    this.tasks = new BackgroundTasks();
  }

  /**
   * Wrapper for BackgroundTasks.createTask that also stores the resulting taskId so tasks can
   * be cancelled.
   *
   * @param {string} name
   * @param {object} args
   * @param {object} args.settings
   * @param {object} args.sequences
   * @param {object} args.controls
   * @param {object} args.images
   * @param {object} callbacks
   * @param {function} callbacks.onProgress
   * @param {function} callbacks.onError
   * @param {function} callbacks.onComplete
   *
   * @private
   */
  createTask(name, args, callbacks) {
    return this.tasks.createTask(name, args, callbacks)
      .then((taskId) => {
        this.runningTasks.push(taskId);
        return taskId;
      });
  }

  exportAudio(args, callbacks) {
    return this.createTask('export/audio', args, callbacks);
  }

  exportTemplate(args, callbacks) {
    return this.createTask('export/template', args, callbacks);
  }

  exportDistribution(args, callbacks) {
    return this.createTask('export/distribution', args, callbacks);
  }

  startPreview(args, callbacks) {
    return this.createTask('export/preview', args, callbacks);
  }

  cancelExports() {
    const tasksToCancel = this.runningTasks;
    this.runningTasks = [];

    return Promise.all(tasksToCancel.map((taskId) => this.tasks.cancelTask(taskId)));
  }
}

export default ExportService;
