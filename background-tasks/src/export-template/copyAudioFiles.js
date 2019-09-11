import fse from 'fs-extra';
import path from 'path';

const copyAudioFiles = (args) => {
  const { outputDir } = args;

  // Because there is no webpack build process anymore, copy the audio files into dist/ here,
  // and remove the default audio files that came with the template.
  return fse.remove(path.join(outputDir, 'dist', 'audio'))
    .then(() => fse.copy(
      path.join(outputDir, 'audio'),
      path.join(outputDir, 'dist', 'audio'),
    ))
    .then(() => args);
};

export default copyAudioFiles;
