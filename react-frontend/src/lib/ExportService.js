import BackgroundTasks from './BackgroundTasks';

/**
 * ExportService class, wraps all interaction with the analyse, encode, and project build APIs.
 */
class ExportService {
  constructor(apiBase) {
    this.runningTasks = [];
    this.tasks = new BackgroundTasks({ apiBase });
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

    return Promise.all(tasksToCancel.map(taskId => this.tasks.cancelTask(taskId)));
  }
}

export default ExportService;
