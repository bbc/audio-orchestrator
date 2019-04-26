import { promisify } from 'util';
import fs from 'fs';

// wrap callback-based methods in a promise API:
const stat = promisify(fs.stat);

/**
 * Check whether the file exists on the file system, stat raises an error if it does not.
 *
 * @returns {Promise}
 */
const processExists = filePath => stat(filePath)
  .then(() => ({ exists: true }));

export default processExists;
