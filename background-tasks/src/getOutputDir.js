import path from 'path';
import os from 'os';
import fse from 'fs-extra';

const getOutputDir = (exportOutputDir) => {
  if (exportOutputDir) {
    return Promise.resolve(exportOutputDir);
  }

  return fse.mkdtemp(path.join(os.tmpdir(), 'bbcat-orchestration-'));
};

export default getOutputDir;
