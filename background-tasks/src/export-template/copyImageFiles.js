import fse from 'fs-extra';
import path from 'path';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('export-template');

/**
 * copies image files to the output folder (to both images/ and dist/images/), and generates an
 * imageUrls object that can be used to reference these images by imageId later.
 */
const copyImageFiles = (args) => {
  const { images, outputDir, fileStore } = args;

  // Promise that resolves once all files have been copied
  return Promise.all(
    Object.values(images || {}).map(({ imageId }) => {
      const {
        filePath,
        probe,
      } = fileStore.getFile(imageId);

      if (!probe) {
        logger.warn(`Ignoring image ${path.basename(filePath)} as it has no probe results recorded.`);
        return null;
      }

      const imageUrl = path.join('images', `${imageId}${path.extname(filePath)}`);
      const imageOutputPath = path.join(outputDir, imageUrl);
      const imageDistOutputPath = path.join(outputDir, 'dist', imageUrl);

      // Promise that resolves when the current file has been copied to both places, and
      // then returns imageId, imageUrl if both copies succeeded,
      // or returns null when either of the copies failed.
      return Promise.all([
        fse.copy(filePath, imageOutputPath),
        fse.copy(filePath, imageDistOutputPath),
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
