import { promisify } from 'util';
import fse from 'fs-extra';
import path from 'path';
import webpackCb from '@bbc/bbcat-orchestration-template/node_modules/webpack'; // TODO only installed as dependency of template, should be in ours.
import templateWorker from './templateWorker';

const webpack = promisify(webpackCb);

const distributionWorker = ({ sequences, settings, outputDir }, onProgress = () => {}) => {
  const total = 3;
  let completed = 0;

  const nextStep = (currentStep) => {
    onProgress({ completed, total, currentStep });
    completed += 1;
  };

  return fse.ensureDir(outputDir)
    .then(() => {
      nextStep('packaging audio and generating template source code');
      return templateWorker({ sequences, settings, outputDir }, () => {});
    })
    .then(() => {
      nextStep('compiling application');

      // outputDir needs to have a node_modules so that the webpack.config can be resolved with
      // all its imports. The template config cannot be used because __dirname is resolved at the
      // time it is imported, and will point into the export-server's node_modules instead.
      const templateNodeModulesPath = path.join(
        path.dirname(require.resolve('@bbc/bbcat-orchestration-template/package.json')),
        'node_modules',
      );
      const outputDirNodeModulesPath = path.join(outputDir, 'node_modules');

      return fse.ensureSymlink(templateNodeModulesPath, outputDirNodeModulesPath)
        .then(() => {
          /* eslint-disable-next-line import/no-dynamic-require, global-require */
          const webpackConfig = require(path.join(outputDir, 'webpack.config.js'));

          // TODO modify config object to set mode to production, and correct paths.
          webpackConfig.mode = 'production';
          webpackConfig.resolve = {
            ...webpackConfig.resolve,
            modules: [templateNodeModulesPath, 'node_modules'],
          };
          webpackConfig.resolveLoader = {
            ...webpackConfig.resolveLoader,
            modules: [templateNodeModulesPath, 'node_modules'],
          };

          return webpack(webpackConfig)
            .then((stats) => {
              if (stats.hasErrors()) {
                const info = stats.toJson();
                console.error(info.errors.join('\n\n'));
                throw new Error(`template compilation failed with ${info.errors.length} errors.`);
              }
            });
        })
        .then(() => fse.remove(outputDirNodeModulesPath));
    })
    .then(() => {
      nextStep('removing temporary files'); // TODO would it be better to keep the template sources?
      return fse.readdir(outputDir)
        .then(files => files.filter(name => name !== 'dist'))
        .then(files => Promise.all(files.map(file => fse.remove(path.join(outputDir, file)))));
    })
    .then(() => {
      nextStep('finished'); // to ensure completed === total
      return { result: true }; // TODO, have to return a { result } but there isn't really a value
    })
    .catch((err) => {
      console.log(err);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default distributionWorker;
