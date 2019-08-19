import fse from 'fs-extra';

/**
 * Check whether the file exists on the file system, stat raises an error if it does not.
 *
 * @returns {Promise}
 */
const processExists = filePath => fse.stat(filePath)
  .then(() => ({ exists: true }));

export default processExists;
