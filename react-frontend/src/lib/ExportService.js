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
    this.get = path => fetch(`${apiBase}/${path}`).then(response => response.json());
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
  }

  /**
   * Polls the status of a task and calls the lifecycle callbacks as tasks are completed.
   *
   * @private
   */
  monitorTask(taskId, { onProgress, onComplete, onError } = {}) {
    const poll = () => {
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
            if (onError) onError();
            return this.deleteTask(taskId);
          }

          // Update progress
          if (onProgress) onProgress({ completed, total, currentStep });

          if (error) {
            if (onError) onError(new ExportError(error, result.missingEncodedItems));
            return null;
          }

          // Task is already complete, no need to poll further. Call the appropriate callback.
          if (completed === total) {
            if (onComplete) onComplete({ result });
            return null;
          }

          // Otherwise, it is not yet complete, wait a bit and try polling again.
          setTimeout(poll, POLL_TIMEOUT);

          return null;
        });
    };

    // schedule the first poll request
    setTimeout(poll, POLL_TIMEOUT);
  }

  /**
   *
   */
  exportAudio({ sequences }, callbacks = {}) {
    return this.post('export/audio', { sequences })
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

  // TODO implement DELETE export/task/<id>
  deleteTask(taskId) {
    return Promise.reject(new Error('deleteTask not implemented'));
  }
}

export default ExportService;
