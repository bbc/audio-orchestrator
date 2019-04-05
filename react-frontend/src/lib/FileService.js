/**
 * FileService class, wraps all interaction with the analyse, encode, and project build APIs.
 */

class FileService {
  constructor(apiBase) {
    this.probePromises = {};
    this.silencePromises = {};

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
   * Create a bunch of files at once, and provide progress updates. Resolve the returned promise
   * when all files have been created successfully.
   *
   * @param {Array<Object>} files - files to create, each a { fileId, path } object.
   * TODO: rewrite once API is updated for progress polling and request bundling.
   * TODO: refactor as this will be the same for any function, except for the "this.create" call.
   */
  createAll(files, {
    onProgress = null,
    onError = null,
    onSuccess = null,
  } = {}) {
    const total = files.length;
    let completed = 0;
    console.log('createAll');

    // The results promises never reject, errors are logged and a success flag unset instead.
    const promises = files.map(({ fileId, path }) => this.create(fileId, path)
      .then((result) => {
        // if it succeeds, call the success handler and return a positive result.
        if (onSuccess) onSuccess({ success: true, fileId, result });
        return { success: true, fileId, result };
      })
      .catch((err) => {
        // if it fails, log the error and return a negative result (but do not reject the promise).
        console.error(err);
        if (onError) onError({ success: false, fileId });
        return { success: false, fileId };
      }));

    // When any of the tasks completes, send a progress update only containing the number of
    // complete and total tasks.
    promises.forEach((p) => {
      // regardless of pass or fail, update progress
      p.finally(() => {
        completed += 1;
        onProgress({ completed, total });
      });
    });

    // Return a promise that resolves once all tasks have completed (succeeded of failed). This
    // resolves to a list of { success, result } objects as returned by the individual promises.
    return Promise.all(promises);
  }

  /**
   * Trigger a basic probe on the referenced file, resolving when the results are available.
   */
  probe(fileId) {
    if (!(fileId in this.probePromises)) {
      this.probePromises[fileId] = this.post(`analyse/${fileId}/probe`, {})
        .then(({ success, probe }) => {
          if (!success) {
            throw new Error('File could not be probed.');
          }
          return probe;
        });
    }

    return this.probePromises[fileId];
  }

  /**
   * Trigger silence analysis on the referenced file, resolving when the results are available.
   */
  silence(fileId) {
    if (!(fileId in this.silencePromises)) {
      this.silencePromises[fileId] = this.post(`analyse/${fileId}/silence`, {})
        .then((response) => {
          if (!response.success) {
            throw new Error('File could not be analysed for silent sections.');
          }
          return response.silence;
        });
    }

    return this.silencePromises[fileId];
  }
}

export default FileService;
