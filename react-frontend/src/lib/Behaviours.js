import { behaviourTypes, behaviourTypeDetails } from './behaviourTypes';

class Behaviours {
  /**
   * Get the details object for one behaviour type
   */
  static getDetails(behaviourType, controls = []) {
    // Special case handling for meta behaviours based on a defined control
    // requires this control to be present in the list of controls
    if (behaviourType.startsWith('control:')) {
      // split the behaviourType, assumes there is no : in controlId (there isn't in uuids)
      const [, controlId] = behaviourType.split(':');

      // find the control
      const control = controls.find(c => c.controlId === controlId) || {};

      const { controlType } = control;

      // build a behaviour type definition like those used in behaviourTypes.js
      return {
        behaviourType,
        control,
        displayName: control.controlName || 'control value',
        description: `Whether the object can be rendered on a device depends on the value of the user control "${control.controlName}" for that device.`,
        multiple: false,
        color: 'orange',
        additive: true,
        parameters: [
          {
            name: 'allowed',
            displayName: 'Control values',
            // TODO relies on knowing the available control types; should perhaps access control
            // type definitions instead.
            description: ['range', 'counter'].includes(controlType)
              ? 'Choose control values for which the object will be allowed.'
              : 'Choose for which user selections the object will be allowed or prohibited.',
            type: 'controlValues',
            defaultValue: [],
          },
        ],
      };
    }

    return {
      ...(behaviourTypeDetails[behaviourType] || {}),
      behaviourType,
    };
  }

  /**
   * Get the details objects for all behaviour types
   */
  static getAllDetails({ includeFixed = true } = {}, controls = []) {
    const details = [
      ...controls.map(({ controlId }) => `control:${controlId}`),
      ...behaviourTypes,
    ].map(behaviourType => Behaviours.getDetails(behaviourType, controls));

    if (!includeFixed) {
      return details.filter(({ fixed }) => !fixed);
    }

    return details;
  }

  /**
   * Get a new behaviour object to be added to an object's behaviours list when adding a behaviour
   * of this type.
   */
  static getDefaultParameters(behaviourType, controls) {
    const { parameters } = Behaviours.getDetails(behaviourType, controls);
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
