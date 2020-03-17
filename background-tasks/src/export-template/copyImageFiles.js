import fse from 'fs-extra';
import path from 'path';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('export-template');

/**
 * copies image files to the output folder (to both images/ and dist/images/), and generates an
 * imageUrls object that can be used to reference these images by imageId later.
 */
const copyImageFiles = (args) => {
  const { images, outputDir } = args;

  // Promise that resolves once all files have been copied
  return Promise.all(
    Object.values(images || {}).map(({ imageId, imagePath }) => {
      const imageUrl = path.join('images', `${imageId}${path.extname(imagePath)}`);
      const imageOutputPath = path.join(outputDir, imageUrl);
      const imageDistOutputPath = path.join(outputDir, 'dist', imageUrl);

      // Promise that resolves when the current file has been copied to both places, and
      // then returns imageId, imageUrl if both copies succeeded,
      // or returns null when either of the copies failed.
      return Promise.all([
        fse.copy(imagePath, imageOutputPath),
        fse.copy(imagePath, imageDistOutputPath),
      ])
        .then(() => ({ imageId, imageUrl }))
        .catch((e) => {
          logger.warn(`failed to copy image ${imageId} ${e}`);
          return null;
        });
    }),
  )
    .then((results) => {
      const imageUrls = {};
      results.filter(r => r !== null).forEach(({ imageId, imageUrl }) => {
        imageUrls[imageId] = imageUrl;
      });

      return {
        ...args,
        imageUrls,
      };
    });
};

export default copyImageFiles;
