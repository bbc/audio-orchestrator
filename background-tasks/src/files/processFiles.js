import mapLimit from 'async/mapLimit';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('process-files');
const CONCURRENCY = 4;
/**
 * processes files in parallel calling the worker for each fileId, and returns a promise resolving
 * to an array of { fileId, success, ...result }.
 *
 * @param {function} worker
 * @param {Array<Object>} args
 * @param {function} onProgress
 *
 * @returns {Promise<Array<Object>>}
 */
const processFiles = (worker, args, onProgress) => {
  const total = args.length;
  let completed = 0;
  onProgress({ total, completed });

  logger.info(`Processing ${total} files with concurrency = ${CONCURRENCY}.`);

  return mapLimit(args, CONCURRENCY, (arg, cb) => {
    worker(arg)
      .then((result) => {
        // Return a successful response
        cb(null, { fileId: arg.fileId, success: true, ...result });
      })
      .catch((err) => {
        // Note, a per-file error in the worker is returned in the response, thus not actually
        // returning an error in the callback.
        cb(null, { fileId: arg.fileId, success: false, error: err.message });
      })
      .finally(() => {
        completed += 1;
        onProgress({ total, completed });
      });
  }).then(result => ({ result }));
};

export default processFiles;
