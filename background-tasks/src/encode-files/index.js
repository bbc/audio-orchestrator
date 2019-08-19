import os from 'os';
import path from 'path';
import fse from 'fs-extra';
import processFiles from '../processFiles';
import worker from './worker';

/**
 */
const encodeFiles = ({ files }, fileStore, onProgress) => {
  const fileIds = files.map(({ fileId }) => fileId);

  // TODO: items should've been stored previously but for now get them from the client.
  files.forEach(({ fileId, items }) => {
    // eslint-disable-next-line no-param-reassign
    fileStore[fileId].items = items;
  });

  return fse.mkdtemp(path.join(os.tmpdir(), 'bbcat-orchestration-'))
    .then(encodedItemsBasePath => processFiles(
      fileStore, worker, fileIds, { files, encodedItemsBasePath }, onProgress,
    ));
};

export default encodeFiles;
