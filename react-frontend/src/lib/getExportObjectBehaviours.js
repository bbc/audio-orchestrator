// TODO this might need to be in the same file to avoid circular import; for now we import this
// method directly instead of including it in the Behaviour class.
import Behaviours from 'Lib/Behaviours';

// Translates the object behaviour list used in the project file and for authoring, to the metadata
// exported for use with the library. Primarily replaces fixed and control behaviours with lower
// level behaviours, and removes some unique identifiers not needed for rendering.
const getExportObjectBehaviours = (objectBehaviours, controls = {}) => {
  // Annotate the object's behaviour data with details from the behaviour type definitions
  const annotatedBehaviours = Behaviours.getAnnotatedObjectBehaviours(objectBehaviours);

  // Start with an empty output list and iterate over the list of behaviours to add to this.
  const exportBehaviours = [];
  objectBehaviours.forEach(({
    behaviourType,
    behaviourParameters,
  }) => {
    // for control behaviour, interpret the parameters based on the control type
    if (behaviourType.startsWith('control:')) {
      const [, controlId] = behaviourType.split(':');
      if (!controls[controlId]) {
        return; // silently ignore missing controls
      }

      // Initialise empty list of conditions. These are added based on the control type. The
      // conditions are then added to an allowedIf behaviour; and inverted versions are added
      // to a prohibitedIf behaviour.
      const conditions = [];

      const { controlType } = controls[controlId];

      switch (controlType) {
        case 'checkbox':
        case 'radio':
          if (behaviourParameters.allowed.length > 0) {
            conditions.push({
              property: `deviceControls.${controlId}`,
              operator: 'anyOf',
              value: behaviourParameters.allowed,
            });
          }
          break;
        case 'range':
        case 'counter':
          {
            // get the min and max values from the allowedd list in the behaviour parameters
            const [min, max] = behaviourParameters.allowed || [];

            // generate a >= min and <= max condition, if min or max are numbers
            if (Number.isFinite(min)) {
              conditions.push({
                property: `deviceControls.${controlId}`,
                operator: 'greaterThanOrEqual',
                value: min,
              });
            }
            if (Number.isFinite(max)) {
              conditions.push({
                property: `deviceControls.${controlId}`,
                operator: 'lessThanOrEqual',
                value: max,
              });
            }
          }
          break;
        default:
          break;
      }

      if (conditions.length > 0) {
        exportBehaviours.push({
          behaviourType: 'allowedIf',
          behaviourParameters: {
            conditions,
          },
        });
        exportBehaviours.push({
          behaviourType: 'prohibitedIf',
          behaviourParameters: {
            conditions: conditions.map(condition => ({
              ...condition,
              invertCondition: !condition.invertCondition,
            })),
          },
        });
      }

      return; // don't process the switch statement below because the behaviour has been dealt with.
    }

    // Depending on the behaviour type, call a handler for the 'normal' and 'fixed' behaviours
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
        // Remove conditionId from conditional behaviours - this is not needed in the metadata file
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
          behaviourParameters,
        });
    }
  });

  return exportBehaviours;
};

export default getExportObjectBehaviours;
