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

import mapLimit from 'async/mapLimit.js';
import { getLogger } from '#logging';

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
