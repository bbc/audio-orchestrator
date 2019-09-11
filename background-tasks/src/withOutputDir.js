import path from 'path';
import os from 'os';
import fse from 'fs-extra';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('withOutputDir');

const withOutputDir = (payload, args = {}) => {
  let { outputDir } = args;

  return Promise.resolve()
    // If outputDir is given, ensure it exists and return original args.
    // Otherwise, create a new temporary directory and inject the outputDir property into args.
    .then(() => {
      if (args.outputDir) {
        return fse.ensureDir(args.outputDir)
          .then(() => args);
      }

      return fse.mkdtemp(path.join(os.tmpdir(), 'bbcat-orchestration-'))
        .then((d) => {
          outputDir = d;
          return { ...args, outputDir };
        });
    })
    // Run the payload function with the args now guaranteed to include an outputDir
    .then(argsWithOutputDir => payload(argsWithOutputDir))
    .catch((err) => {
      logger.warn(`removing outputDir ${outputDir} after error in payload function.`);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default withOutputDir;
