export const behaviourTypes = [
  'mainDeviceOnly',
  'auxDevicesOnly',
  'allowedEverywhere',
  'spread',
  'preferredIf',
  'allowedIf',
  'prohibitedIf',
  'exclusive',
  'onChange',
];

export const behaviourTypeDetails = {
  mainDeviceOnly: {
    displayName: 'main device only',
    description: 'The object is prohibited from any devices but the main device (the one that creates the session).',
    multiple: false,
    color: 'orange',
  },
  auxDevicesOnly: {
    displayName: 'auxiliary devices only',
    description: 'The object is prohibited from the main device (the one that creates the session).',
    multiple: false,
    color: 'orange',
  },
  allowedEverywhere: {
    displayName: 'allowed everywhere',
    description: 'The object is allowed on every device it is not prohibited from by another behaviour.',
    multiple: false,
    color: 'teal',
  },
  spread: {
    displayName: 'spread',
    description: 'The object will be allocated to all devices it is allowed in after all behaviours have been taken into account.',
    multiple: false,
    color: 'teal',
    parameters: [
      {
        name: 'perDeviceGainAdjust',
        description: 'When the object is in multiple devices, multiply its gain by this value for each additional device it is in beyond the first one; applies the same adjustment to every device.',
        type: 'gain',
        defaultValue: 0.0,
      },
    ],
  },
  preferredIf: {
    displayName: 'preferred if',
    description: 'The object will be preferred on any device that fulfills all of the conditions added to this behaviour.',
    multiple: true,
    color: 'green',
    parameters: [
      {
        name: 'conditions',
        description: 'The conditions to be met by the session or device.',
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  allowedIf: {
    displayName: 'allowed if',
    description: 'The object will be allowed on any device that fulfills all of the conditions added to this behaviour.',
    multiple: true,
    color: 'yellow',
    parameters: [
      {
        name: 'conditions',
        description: 'The conditions to be met by the session or device.',
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  prohibitedIf: {
    displayName: 'prohibited if',
    description: 'The object will be prohibited on any device that fulfills all of the conditions added to this behaviour.',
    multiple: true,
    color: 'red',
    parameters: [
      {
        name: 'conditions',
        description: 'The conditions to be met by the session or device.',
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  exclusive: {
    displayName: 'exclusive',
    description: 'The object will take control of the device it is assigned to, and prevent other objects from being assigned to the same device.',
    multiple: false,
    color: 'pink',
  },
  onChange: {
    displayName: 'on change',
    description: 'Determines what happens to the object when devices join or leave, or when a control value changes.',
    multiple: false,
    color: 'violet',
    parameters: [
      {
        name: 'start',
        type: 'enum',
        description: 'Determines when the object can start playing.',
        defaultValue: 'canAlwaysStart',
        allowedValues: [
          { value: 'canAlwaysStart', displayName: 'Can always start' },
          { value: 'canNeverStart', displayName: 'Can never start' },
          { value: 'canOnlyStartOnFirstRun', displayName: 'Can only start on first run' },
        ],
      },
      {
        name: 'allocate',
        type: 'listOfEnum',
        description: 'Determines when the object can or should move to another device.',
        defaultValue: ['moveToPreferred', 'stayInPrevious', 'moveToAllowedNotPrevious', 'moveToAllowed'],
        allowedValues: [
          { value: 'moveToPreferred', displayName: 'Move to preferred' },
          { value: 'stayInPrevious', displayName: 'Stay in previous' },
          { value: 'moveToAllowedNotPrevious', displayName: 'Move to allowed - not previous' },
          { value: 'moveToAllowed', displayName: 'Move to allowed' },
        ],
      },
    ],
  },
};
