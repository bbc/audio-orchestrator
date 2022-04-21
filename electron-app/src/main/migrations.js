import path from 'path';
import { electronLogger as logger } from 'bbcat-orchestration-builder-logging';

// Project file migrations
// * The keys used in the migrations object represent the versions being migrated to.
// * All migrations with a higher version than that of the project file will be applied in order.
// * If no version is set in a project file, it is assumed to be 0.0.0 and all migrations are used.
// * The project file's version will be set to the projectVersion given when the store is created;
//   currently this is set to use the version in the electron-app package.json.

const migrations = {
  '0.16.0': (store) => {
    // This is the first migration; it will be applied to any project file that does not have a
    // version set by the electron-store package. As we are now using electron-store migrations,
    // the old project store version is no longer required.
    logger.info('running migration: 0.16.0, removing _PROJECT_STORE_VERSION property.');
    store.delete('_PROJECT_STORE_VERSION');
  },
  '0.16.1': (store) => {
    // Add playerImageAltText property to project settings
    logger.info('running migration: 0.16.1, add playerImageAltText to project settings.');
    const settings = store.get('settings');
    if (settings) {
      store.set('settings', {
        ...settings,
        playerImageAltText: '',
      });
    }
  },
  '0.18.3': (store) => {
    // Add imageIndex, imageFilename, imageAlt properties to images
    logger.info('running migration: 0.18.3, add imageIndex, imageFilename, imageAlt properties to images.');
    const images = store.get('images', {});
    const settings = store.get('settings', {});
    const { playerImageId, playerImageAltText } = settings;
    const newImages = {};
    Object.values(images).forEach((image, i) => {
      const { imageId, imagePath } = image;
      let { imageIndex, imageAlt } = image;

      // set the imageFilename e.g. foo.jpg
      const imageFilename = path.parse(imagePath).base;

      // Generate imageIndex and imageAlt if they are note already set
      if (imageIndex === undefined) { imageIndex = i; }
      if (imageAlt === undefined) { imageAlt = ''; }

      // if the image is used as the default player image (appearance page) it might have an
      // alt text defined in the settings.
      if (playerImageId === imageId && playerImageAltText) {
        imageAlt = playerImageAltText;
      }

      // combine with any exisitng properties of the original image object
      newImages[imageId] = {
        ...image,
        imageFilename,
        imageAlt,
        imageIndex: imageIndex !== undefined ? imageIndex : i,
      };
    });

    // overwrite the images object
    store.set('images', newImages);
  },
  '0.19.5': (store) => {
    // Add fadeOutDuration to project settings
    logger.info('running migration: 0.19.5, add fadeOutDuration to project settings.');
    const settings = store.get('settings');
    if (settings) {
      store.set('settings', {
        ...settings,
        fadeOutDuration: settings.fadeOutDuration || 0,
      });
    }
  },
  '0.19.6': (store) => {
    // Replace moduloIsZero (modulus) conditions with modulo ([modulus, offset])
    logger.info('running migration: 0.19.6, replace moduloIsZero with modulo conditional operator.');
    const sequenceIds = store.get('sequenceIds', []);
    sequenceIds.forEach((sequenceId) => {
      const objectsKey = `sequences.${sequenceId}.objects`;
      const objects = store.get(objectsKey, {});
      const newObjects = {};
      Object.entries(objects).forEach(([k, object]) => {
        const newBehaviours = (object.objectBehaviours || []).map((behaviour) => {
          const { behaviourType, behaviourParameters = {} } = behaviour;
          if (['allowedIf', 'preferredIf', 'prohibitedIf'].includes(behaviourType)) {
            const { conditions = [] } = behaviourParameters;
            return {
              ...behaviour,
              behaviourParameters: {
                ...behaviourParameters,
                conditions: conditions.map((condition) => {
                  if (condition.operator === 'moduloIsZero') {
                    if (Array.isArray(condition.value)) {
                      return condition;
                    }

                    return {
                      ...condition,
                      operator: 'modulo',
                      value: [condition.value, condition.value],
                    };
                  }
                  return condition;
                }),
              },
            };
          }

          // return other behaviour types unchanged
          return behaviour;
        });
        newObjects[k] = {
          ...object,
          objectBehaviours: newBehaviours,
        };
      });

      store.set(objectsKey, newObjects);
    });
  },
  '0.22.0': (store) => {
    logger.info('running migration: 0.22.0, add syncEndpointType to project settings.');
    const settings = store.get('settings');
    if (settings) {
      store.set('settings', {
        ...settings,
        syncEndpointType: settings.syncEndpointType || 'cloud-sync',
      });
    }
  },
};

export default migrations;
