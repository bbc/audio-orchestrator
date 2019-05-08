const POLL_TIMEOUT = 1000;

/**
 * Immediately calls the progress and success callbacks, for when an empty list of tasks is used.
 *
 * @returns Promise
 */
const shortcutSuccess = ({ onProgress, onComplete } = {}) => {
  if (onProgress) onProgress({ completed: 0, total: 0 });
  if (onComplete) onComplete({ results: [] });

  return Promise.resolve();
};

/**
 * FileService class, wraps all interaction with the analyse, encode, and project build APIs.
 */
class FileService {
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
   * Polls the status of a batch and calls the lifecycle callbacks as tasks are completed.
   *
   * @private
   */
  monitorBatch(batchId, { onProgress, onComplete, onError } = {}) {
    const poll = () => {
      this.get(`analyse/batch/${batchId}`)
        .then(({ success, completed, total }) => {
          // Did not successfully poll the batch status -> give up.
          if (!success) {
            if (onError) onError();
            return;
          }

          // Update progress
          if (onProgress) onProgress({ completed, total });

          // Batch is complete -> fetch results and pass them to the callback
          if (completed === total) {
            this.get(`analyse/batch/${batchId}/results`)
              .then((results) => {
                if (!results.success) {
                  if (onError) onError();
                  return;
                }
                if (onComplete) onComplete({ results: results.results });
              });
            return;
          }

          // Otherwise, it is not yet complete, wait a bit and try polling again.
          setTimeout(poll, POLL_TIMEOUT);
        });
    };

    // schedule the first poll request
    setTimeout(poll, POLL_TIMEOUT);
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

    return this.post('analyse/create', { files })
      .then(({ success, batchId }) => {
        if (!success) throw new Error('could not create batch for creating files');

        this.monitorBatch(batchId, callbacks);
      });
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

    return this.post('analyse/probe', { fileIds })
      .then(({ success, batchId }) => {
        if (!success) throw new Error('Could not create batch for probe analysis');

        this.monitorBatch(batchId, callbacks);
      });
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

    return this.post('analyse/items', { fileIds })
      .then(({ success, batchId }) => {
        if (!success) throw new Error('Could not create batch for items analysis');

        this.monitorBatch(batchId, callbacks);
      });
  }

  /**
   * Encode a bunch of files using the items information.
   *
   * @param {Array<Object>} files - files to create, each like { fileId, path, items, sequenceId }.
   */
  encodeAll(files, callbacks = {}) {
    if (files.length === 0) {
      return shortcutSuccess(callbacks);
    }

    return this.post('analyse/encode', { files })
      .then(({ success, batchId }) => {
        if (!success) throw new Error('Could not create batch for encoding');

        this.monitorBatch(batchId, callbacks);
      });
  }
}

export default FileService;
