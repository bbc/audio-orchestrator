import fse from 'fs-extra';
import path from 'path';

/**
 * Copies image files from images/ to dist/images
 */
const copyImageFiles = (args) => {
  const { outputDir } = args;

  return fse.copy(
    path.join(outputDir, 'images'),
    path.join(outputDir, 'dist', 'images'),
  )
    .then(() => args);
};

export default copyImageFiles;
