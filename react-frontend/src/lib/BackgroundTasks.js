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

const POLL_TIMEOUT = 1000;

class BackgroundTasks {
  constructor() {
    this.service = window.backgroundTaskFunctions;
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
