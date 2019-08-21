import fse from 'fs-extra';

/**
 * Check whether the file exists on the file system, stat raises an error if it does not.
 *
 * @returns {Promise}
 */
const checkFileExists = filePath => fse.stat(filePath)
  .then(() => true);

export default checkFileExists;
