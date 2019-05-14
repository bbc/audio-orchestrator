import fse from 'fs-extra';
import path from 'path';

import startPreview from './previewServer';
import distributionWorker from './distributionWorker';

const previewWorker = ({ sequences, settings, outputDir }, onProgress = () => {}) => {
  const total = 2;
  let completed = 0;

  const nextStep = (currentStep) => {
    onProgress({ completed, total, currentStep });
    completed += 1;
  };

  const distDir = path.join(outputDir, 'dist');

  return fse.ensureDir(distDir)
    .then(() => {
      nextStep('initialising preview server'); // 0

      // start the server first because its chosen port number is needed to for the joiningLink.
      return startPreview(distDir);
    })
    .then(({ stop, url }) => {
      nextStep('building application'); // 1

      return distributionWorker({
        sequences,
        settings: {
          ...settings,
          joiningLink: `${url}#!/join`,
        },
        outputDir,
      }, () => {})
        .then(() => ({ stop, url }));
    })
    .then(({ stop, url }) => {
      nextStep('finished'); // 2, to ensure completed === total
      // TODO see where the stopPreview function can be stored, in task / createWorker?
      return { result: true, url, stopPreview: stop };
    })
    .catch((err) => {
      console.log(err);

      return fse.remove(outputDir).finally(() => {
        throw err;
      });
    });
};

export default previewWorker;
