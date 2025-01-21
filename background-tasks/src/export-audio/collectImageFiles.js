/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import fse from 'fs-extra';
import path from 'path';
import { getLogger } from '#logging';

const logger = getLogger('export-audio');

const imageDirName = 'images';

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
  return usedImageIds;
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

  logger.debug(`Collecting ${usedImageIds.size} image files`);

  const imageOutputDir = path.join(outputDir, imageDirName);

  // Resolves once all files have been copied
  // TODO should probably serialise the copies rather than starting all at the same time.
  return fse.ensureDir(imageOutputDir).then(() => Promise.all(
    Object.values(images || {})
      .filter(({ imageId }) => usedImageIds.has(imageId))
      .map(({ imageId, imageAlt }) => {
        const {
          filePath,
          probe,
        } = fileStore.getFile(imageId);

        if (!probe) {
          logger.warn(`Ignoring image ${path.basename(filePath)} as it has no probe results recorded.`);
          return null;
        }

        // Construct a filename based on the UUID and original extension
        const imageFileName = `${imageId}${path.extname(filePath)}`;

        // The URL written to the sequence.json file (always uses forward slash)
        const imageUrl = [imageDirName, imageFileName].join('/');

        // The filesystem path used to copy the file into the output directory
        const imageOutputPath = path.join(imageOutputDir, imageFileName);

        return fse.copy(filePath, imageOutputPath)
          .then(() => ({ imageId, imageUrl, imageAlt }))
          .catch((e) => {
            logger.warn(`Could not copy image ${imageUrl}: ${e}`);
            return null;
          });
      }),
  )).then((results) => {
    const imageUrls = {};
    const imageAltTexts = {};
    results.filter(r => r !== null).forEach(({ imageId, imageUrl, imageAlt }) => {
      imageUrls[imageId] = imageUrl;
      imageAltTexts[imageId] = imageAlt;
    });

    return {
      ...args,
      imageUrls,
      imageAltTexts,
    };
  });
};

export default collectImageFiles;
