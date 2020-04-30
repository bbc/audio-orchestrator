// TODO this might need to be in the same file to avoid circular import; for now we import this
// method directly instead of including it in the Behaviour class.
import Behaviours from 'Lib/Behaviours';

// Translates the object behaviour list used in the project file and for authoring, to the metadata
// exported for use with the library. Primarily replaces fixed and control behaviours with lower
// level behaviours, and removes some unique identifiers not needed for rendering.
const getExportObjectBehaviours = (objectBehaviours) => {
  // Annotate the object's behaviour data with details from the behaviour type definitions
  const annotatedBehaviours = Behaviours.getAnnotatedObjectBehaviours(objectBehaviours);

  // Start with an empty output list and iterate over the list of behaviours to add to this.
  const exportBehaviours = [];
  objectBehaviours.forEach(({
    behaviourType,
    behaviourParameters,
  }) => {
    // Depending on the behaviour type, call a handler
    switch (behaviourType) {
      case 'fixedDevices':
        // The fixedDevices behaviour is translated to a prohibitedIf excluding the de-selected
        // device categories. If the user has not added any additive behaviours, an
        // allowedEverywhere is also added.

        // we need an allowedEverywhere, but only if every behaviour on the object is not additive
        if (annotatedBehaviours.every(({ additive }) => !additive)) {
          exportBehaviours.push({
            behaviourType: 'allowedEverywhere',
          });
        }

        // for the main-only and aux-only setting, add a prohibitedIf behaviour.
        switch (behaviourParameters.deviceType) {
          case 'main': // prohibit from main device
            exportBehaviours.push({
              behaviourType: 'prohibitedIf',
              behaviourParameters: {
                conditions: [
                  {
                    property: 'device.deviceIsMain',
                    operator: 'equals',
                    value: false,
                  },
                ],
              },
            });
            break;
          case 'aux': // prohibit from main device
            exportBehaviours.push({
              behaviourType: 'prohibitedIf',
              behaviourParameters: {
                conditions: [
                  {
                    property: 'device.deviceIsMain',
                    operator: 'equals',
                    value: true,
                  },
                ],
              },
            });
            break;
          default:
            // don't do anything for mainAndAux
        }
        break;
      case 'fixedSpread':
        // add a spread behaviour, a spread behaviour with adjustment, or nothing at all.
        switch (behaviourParameters.spread) {
          case 'spread':
            exportBehaviours.push({
              behaviourType: 'spread',
            });
            break;
          case 'spreadWithSmallGainReduction':
            exportBehaviours.push({
              behaviourType: 'spread',
              behaviourParameters: {
                perDeviceGainAdjust: -3,
              },
            });
            break;
          default:
            // doNotSpread - don't need to add a behaviour because not spreading is the default.
            break;
        }
        break;
      case 'allowedIf':
      case 'preferredIf':
      case 'prohibitedIf':
        exportBehaviours.push({
          behaviourType,
          behaviourParameters: {
            conditions: behaviourParameters.conditions.map((condition) => {
              const newCondition = { ...condition };
              delete newCondition.conditionId;

              return newCondition;
            }),
          },
        });
        break;
      default:
        exportBehaviours.push({
          behaviourType,
          behaviourParameters, // TODO remove conditionId from conditions
        });
    }
  });

  return exportBehaviours;
};

export default getExportObjectBehaviours;
