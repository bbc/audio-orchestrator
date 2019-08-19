const POLL_TIMEOUT = 1000;

class HttpService {
  constructor(apiBase) {
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
}

class BackgroundTasks {
  constructor({ service, apiBase }) {
    this.service = service || new HttpService(apiBase);
  }

  createTask(name, args, callbacks = {}) {
    return this.service.post(name, args)
      .then(({ success, taskId }) => {
        if (!success) throw new Error(`Could not create task: ${name}`);

        this.monitorTask(taskId, callbacks);

        return taskId;
      });
  }

  cancelTask(taskId) {
    return this.service.delete(`task/${taskId}`);
  }

  /**
   * Polls the task status and calls the onProgress, onComplete, onError callbacks as appropriate.
   *
   * @private
   */
  monitorTask(taskId, { onProgress, onComplete, onError }) {
    const poll = () => {
      this.service.get(`task/${taskId}`)
        .then((response) => {
          const {
            success,
            error,
            completed,
            total,
            currentStep,
            result,
          } = response;

          // Did not successfully poll the task status, stop polling.
          if (!success) {
            if (onError) onError(new Error('Could not get task status'));
            return;
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

          // If task has an error message set, report this and stop polling.
          if (error) {
            if (onError) onError(new Error(error));
            return;
          }

          // Task is already complete, report result and stop polling.
          if (result) {
            if (onComplete) onComplete({ result, taskId });
            return;
          }

          // Otherwise, it is not yet complete, so keep polling.
          setTimeout(poll, POLL_TIMEOUT);
        })
        .catch((error) => {
          // An error occured in getting the status from the server, raise it and stop polling.
          if (onError) onError(error);
        });
    };
    setTimeout(poll, POLL_TIMEOUT);
  }
}

export default BackgroundTasks;
