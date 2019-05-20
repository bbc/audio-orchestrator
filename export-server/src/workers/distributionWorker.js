import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import webpack from '@bbc/bbcat-orchestration-template/node_modules/webpack'; // TODO only installed as dependency of template, should be in ours.
import ProgressPlugin from '@bbc/bbcat-orchestration-template/node_modules/webpack/lib/ProgressPlugin';
import templateWorker from './templateWorker';
import ProgressReporter from './progressReporter';

const distributionWorker = ({ sequences, settings, outputDir }, onProgress = () => {}) => {
  const progress = new ProgressReporter(3, onProgress);

  return fse.ensureDir(outputDir)
    .then(() => {
      const onTemplateProgress = progress.advance('packaging audio and generating template source code');
      return templateWorker({ sequences, settings, outputDir }, onTemplateProgress);
    })
    .then(() => {
      const onCompileProgress = progress.advance('compiling application');

      // outputDir needs to have a node_modules so that the webpack.config can be resolved with
      // all its imports. The template config cannot be used because __dirname is resolved at the
      // time it is imported, and will point into the export-server's node_modules instead.
      const templateNodeModulesPath = path.join(
        path.dirname(require.resolve('@bbc/bbcat-orchestration-template/package.json')),
        'node_modules',
      ).replace('app.asar/', 'app.asar.unpacked/');
      const outputDirNodeModulesPath = path.join(outputDir, 'node_modules');

      logger.debug(`creating symlink to ${templateNodeModulesPath} as ${outputDirNodeModulesPath}`);

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

          const compiler = webpack(webpackConfig);
          compiler.apply(new ProgressPlugin((percent, message) => {
            onCompileProgress({ completed: percent * 100, total: 100, currentStep: message });
          }));

          return new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
              if (err) {
                logger.info('webpack error:', err);
                reject(err);
              } else {
                logger.info('webpack resolved.');

                if (stats.hasErrors()) {
                  const info = stats.toJson();
                  logger.error(info.errors.join('\n\n'));
                  reject(new Error(`template compilation failed with ${info.errors.length} errors.`));
                } else {
                  resolve();
                }
              }
            });
          });
        })
        .then(() => fse.remove(outputDirNodeModulesPath));
    })
    .then(() => {
      progress.advance('removing temporary files'); // TODO would it be better to keep the template sources?
      return fse.readdir(outputDir)
        .then(files => files.filter(name => name !== 'dist'))
        .then(files => Promise.all(files.map(file => fse.remove(path.join(outputDir, file)))));
    })
    .then(() => {
      progress.complete();
      return { result: true }; // TODO, have to return a { result } but there isn't really a value
    })
    .catch((err) => {
      logger.info(err);
      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default distributionWorker;
