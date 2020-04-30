import { behaviourTypes, behaviourTypeDetails } from './behaviourTypes';

class Behaviours {
  /**
   * Get the details object for one behaviour type
   */
  static getDetails(behaviourType) {
    return {
      ...(behaviourTypeDetails[behaviourType] || {}),
      behaviourType,
    };
  }

  /**
   * Get the details objects for all behaviour types
   */
  static getAllDetails({ includeFixed = true } = {}) {
    const details = behaviourTypes.map(behaviourType => Behaviours.getDetails(behaviourType));
    if (!includeFixed) {
      return details.filter(({ fixed }) => !fixed);
    }

    return details;
  }

  /**
   * Get a new behaviour object to be added to an object's behaviours list when adding a behaviour
   * of this type.
   */
  static getDefaultParameters(behaviourType) {
    const { parameters } = behaviourTypeDetails[behaviourType] || {};
    const defaultParameters = {};
    (parameters || []).forEach(({ name: parameterName, defaultValue }) => {
      defaultParameters[parameterName] = defaultValue;
    });
    return defaultParameters;
  }

  /**
   * Get a version of the object's behaviours list annotated with information from the behaviour
   * types and sorted such that the fixed behaviours appear first.
   */
  static getAnnotatedObjectBehaviours(objectBehaviours) {
    // Combine the data from the objectBehaviours with the data from the details
    // The original behaviour has e.g. behaviourId, behaviourType, behaviourParameters.
    // The behaviour details add e.g. displayName, parameters, color, fixed (see behaviourTypes.js).
    const annotatedBehaviours = objectBehaviours.map(behaviour => ({
      ...behaviour,
      ...Behaviours.getDetails(behaviour.behaviourType),
    }));

    // Put the fixed behaviours first
    return [
      ...annotatedBehaviours.filter(({ fixed }) => fixed),
      ...annotatedBehaviours.filter(({ fixed }) => !fixed),
    ];
  }
}

export default Behaviours;
