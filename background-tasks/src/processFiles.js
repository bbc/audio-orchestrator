import { analyseLogger as logger } from 'bbcat-orchestration-builder-logging'; // TODO
import mapLimit from 'async/mapLimit';

const CONCURRENCY = 4;

/**
 * processes files in parallel calling the worker for each fileId, and returns a promise resolving
 * to an array of { fileId, success, ...result }.
 *
 * TODO: it should also update the file store with the results, and use cached results?
 */
const processFiles = (fileStore, worker, fileIds, args, onProgress) => {
  const total = fileIds.length;
  let completed = 0;
  onProgress({ total, completed });
  return mapLimit(fileIds, CONCURRENCY, (fileId, cb) => {
    if (!(fileId in fileStore)) {
      logger.warn(`fileId not registered: ${fileId}`);
      cb(new Error('fileId not registered'));
      return;
    }

    const file = fileStore[fileId];
    const { filePath, items } = file;

    // TODO should perhaps pass in FileStore and fileId instead of filePath and items so each
    // worker implementation can choose which bits of file state to consume and update (only
    // encode uses this).
    worker(filePath, args, { items })
      .then((result) => {
        // Return a successful response
        cb(null, { fileId, success: true, ...result });
      })
      .catch((err) => {
        // Note, a per-file error in the worker is returned in the response, thus not actually
        // returnin an error in the callback.
        cb(null, { fileId, success: false, error: err.message });
      })
      .finally(() => {
        completed += 1;
        onProgress({ total, completed });
      });
  }).then(result => ({ result }));
};

export default processFiles;
