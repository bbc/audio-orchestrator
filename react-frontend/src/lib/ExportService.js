const POLL_TIMEOUT = 500;

class ExportError extends Error {
  constructor(message, missingEncodedItems = null) {
    super(message);
    this.missingEncodedItems = missingEncodedItems;
  }
}

/**
 * ExportService class, wraps all interaction with the analyse, encode, and project build APIs.
 */
class ExportService {
  constructor(apiBase) {
    this.runningTasks = {};

    // GET request wrapper
    this.get = path => fetch(`${apiBase}/${path}`)
      .then(response => response.json());

    // POST request wrapper
    this.post = (path, data) => fetch(
      `${apiBase}/${path}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    )
      .then(response => response.json());

    // DELETE request wrapper
    this.delete = path => fetch(`${apiBase}/${path}`, { method: 'delete' })
      .then(response => response.json());
  }

  /**
   * Polls the status of a task and calls the lifecycle callbacks as tasks are completed.
   *
   * @private
   */
  monitorTask(taskId, { onProgress, onComplete, onError } = {}) {
    this.runningTasks[taskId] = true;
    const poll = () => {
      // Don't poll if the task doesn't exist anymore.
      if (!(taskId in this.runningTasks)) {
        onError(new ExportError('Export cancelled by user'));
      }

      this.get(`export/task/${taskId}`)
        .then((response) => {
          const {
            success,
            error,
            completed,
            total,
            currentStep,
            result,
          } = response;

          // Did not successfully poll the task status -> give up.
          if (!success) {
            if (onError) onError(new Error('could not get task status'));
            return this.deleteTask(taskId);
          }

          // Update progress
          if (onProgress) {
            onProgress({
              completed,
              total,
              currentStep,
              taskId,
            });
          }

          if (error) {
            if (onError) onError(new ExportError(error, result.missingEncodedItems));
            return null;
          }

          // Task is already complete, no need to poll further. Call the appropriate callback.
          if (completed === total) {
            if (onComplete) onComplete({ result, taskId });
            return null;
          }

          // Otherwise, it is not yet complete, wait a bit and try polling again.
          setTimeout(poll, POLL_TIMEOUT);

          return null;
        })
        .catch((error) => {
          // An error occured in getting the status from the server, raise it and stop polling.
          if (onError) onError(error);
        });
    };

    // schedule the first poll request
    setTimeout(poll, POLL_TIMEOUT);
  }

  /**
   *
   */
  exportAudio({ sequences, settings }, callbacks = {}) {
    return this.post('export/audio', { sequences, settings })
      .then(({ success, taskId }) => {
        if (!success) throw new Error('could not create task for exporting audio');

        this.monitorTask(taskId, callbacks);
      });
  }

  /**
   *
   */
  exportTemplate({ sequences, settings }, callbacks = {}) {
    return this.post('export/template', { sequences, settings })
      .then(({ success, taskId }) => {
        if (!success) throw new Error('could not create task for exporting template');

        this.monitorTask(taskId, callbacks);
      });
  }

  /**
   *
   */
  exportDistribution({ sequences, settings }, callbacks = {}) {
    return this.post('export/distribution', { sequences, settings })
      .then(({ success, taskId }) => {
        if (!success) throw new Error('could not create task for exporting distribution');

        this.monitorTask(taskId, callbacks);
      });
  }

  /**
   *
   */
  startPreview({ sequences, settings }, callbacks = {}) {
    return this.post('export/preview', { sequences, settings })
      .then(({ success, taskId }) => {
        if (!success) throw new Error('could not create task for starting preview');

        this.monitorTask(taskId, callbacks);
      });
  }

  /**
   *
   */
  cancelExports() {
    return Promise.all(Object.keys(this.runningTasks)
      .map(taskId => this.delete(`export/task/${taskId}`)
        .then(() => {
          delete this.runningTasks[taskId];
        })));
  }
}

export default ExportService;
