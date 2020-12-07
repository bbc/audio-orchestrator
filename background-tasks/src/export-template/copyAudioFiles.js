import fse from 'fs-extra';
import path from 'path';
import mapSeries from 'async/mapSeries';

const copyAudioFiles = (args) => {
  const { outputDir, settings } = args;

  // Because there is no webpack build process anymore, copy the audio files into dist/ here,
  // and remove the default audio files that came with the template.
  const outputDistAudioDir = path.join(outputDir, 'dist', 'audio');
  return fse.readdir(outputDistAudioDir)
    .then((files) => {
      // Delete audio files shipped with the template from dist/audio, except if they are needed
      // for the calibration option (and that option is enabled)
      const filesToDelete = settings.enableCalibration
        ? files.filter(file => path.basename(file) !== 'calibration')
        : files;
      return mapSeries(
        filesToDelete,
        (name, cb) => {
          fse.remove(path.join(outputDistAudioDir, name))
            .then(result => cb(null, result))
            .catch(err => cb(err));
        },
      );
    })
    .then(() => fse.copy(
      path.join(outputDir, 'audio'),
      path.join(outputDir, 'dist', 'audio'),
    ))
    .then(() => args);
};

export default copyAudioFiles;
