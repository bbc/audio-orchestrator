const POLL_TIMEOUT = 1000;

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

  list() {
    return this.get('/analyse')
      .then(({ success, files }) => {
        if (!success) {
          throw new Error('Could not list remote files.');
        }
        return files;
      });
  }

  /**
   * Create a file object on the server, checking if the given path can be accessed.
   */
  create(fileId, path) {
    return this.post('analyse', {
      fileId,
      path,
    })
      .then(({ success, file }) => {
        if (!success) {
          throw new Error('File could not be accessed.');
        }
        return file;
      });
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
    return this.post('analyse/probe', { fileIds })
      .then(({ success, batchId }) => {
        if (!success) throw new Error('Could not create batch for probe analysis');

        this.monitorBatch(batchId, callbacks);
      });
  }

  /**
   * Create a bunch of files at once, and provide progress updates. Resolve the returned promise
   * when all files have been created successfully.
   *
   * @param {Array<Object>} files - files to create, each a { fileId, path } object.
   */
  silenceAll(fileIds, callbacks = {}) {
    return this.post('analyse/silence', { fileIds })
      .then(({ success, batchId }) => {
        if (!success) throw new Error('could not create batch for silence analysis');

        this.monitorBatch(batchId, callbacks);
      });
  }
}

export default FileService;
