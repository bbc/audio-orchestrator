import fse from 'fs-extra';
import path from 'path';
import { getLogger } from 'bbcat-orchestration-builder-logging';

const logger = getLogger('export-audio');

const getImagesFromSequences = (sequences) => {
  const usedImageIds = new Set();
  sequences.forEach(({ objects = [] } = {}) => {
    objects.forEach(({ objectBehaviours = [] } = {}) => {
      const { behaviourParameters = {} } = objectBehaviours
        .find(b => b.behaviourType === 'imageEffects') || {};
      const { items = [] } = behaviourParameters;

      items.forEach(({ imageId }) => usedImageIds.add(imageId));
    });
  });
};

/**
 * copies image files to the output folder (images/), and generates an
 * imageUrls object that can be used to reference these images by imageId later.
 *
 * TODO: currently fails silently on missing image files because there is no way to remove image
 * references from the UI yet.
 */
const collectImageFiles = (args) => {
  const {
    sequences, settings, images, outputDir, fileStore,
  } = args;

  // Check all objects in all sequences and collect the imageIds referenced in their imageEffects
  // behaviour
  // TODO this logic is almost the same as what happens in generateSequenceMetadata.
  const usedImageIds = new Set(getImagesFromSequences(sequences));
  usedImageIds.add(settings.playerImageId);

  // Promise that resolves once all files have been copied
  return Promise.all(
    Object.values(images || {})
      .filter(({ imageId }) => usedImageIds.has(imageId))
      .map(({ imageId }) => {
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

        return fse.copy(filePath, imageOutputPath)
          .then(() => ({ imageId, imageUrl }))
          .catch((e) => {
            logger.warn(`Could not copy image ${imageUrl}: ${e}`);
            return null;
          });
      }),
  ).then((results) => {
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

export default collectImageFiles;
