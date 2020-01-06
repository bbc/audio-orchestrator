const behaviourTypes = [
  {
    name: 'mainDeviceOnly',
    displayName: 'main device only',
    description: 'The object is prohibited from any devices but the main device (the one that creates the session).',
    multiple: false,
    color: 'orange',
  },
  {
    name: 'auxDevicesOnly',
    displayName: 'auxiliary devices only',
    description: 'The object is prohibited from the main device (the one that creates the session).',
    multiple: false,
    color: 'orange',
  },
  {
    name: 'allowedEverywhere',
    displayName: 'allowed everywhere',
    description: 'The object is allowed on every device it is not prohibited from by another behaviour.',
    multiple: false,
    color: 'teal',
  },
  {
    name: 'spread',
    displayName: 'spread',
    description: 'The object will be allocated to all devices it is allowed in after all behaviours have been taken into account.',
    multiple: false,
    color: 'teal',
    parameters: [
      {
        name: 'perDeviceGainAdjust',
        description: 'When the object is in multiple devices, multiply its gain by this value for each additional device it is in beyond the first one; applies the same adjustment to every device.',
        required: false,
        type: 'number',
        defaultValue: 1.0,
      },
    ],
  },
  {
    name: 'preferredIf',
    displayName: 'preferred if',
    description: 'The object will be preferred on any device that fulfills all of the conditions added to this behaviour.',
    multiple: true,
    color: 'green',
    parameters: [
      {
        name: 'conditions',
        description: 'The conditions to be met by the session or device.',
        required: true,
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  {
    name: 'allowedIf',
    displayName: 'allowed if',
    description: 'The object will be allowed on any device that fulfills all of the conditions added to this behaviour.',
    multiple: true,
    color: 'yellow',
    parameters: [
      {
        name: 'conditions',
        description: 'The conditions to be met by the session or device.',
        required: true,
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  {
    name: 'prohibitedIf',
    displayName: 'prohibited if',
    description: 'The object will be prohibited on any device that fulfills all of the conditions added to this behaviour.',
    multiple: true,
    color: 'red',
    parameters: [
      {
        name: 'conditions',
        description: 'The conditions to be met by the session or device.',
        required: true,
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  {
    name: 'exclusive',
    displayName: 'exclusive',
    description: 'The object will take control of the device it is assigned to, and prevent other objects from being assigned to the same device.',
    multiple: false,
    color: 'pink',
  },
  {
    name: 'onChange',
    displayName: 'onChange',
    description: 'Determines when the object can start playing, and if it can or should move between devices when devices join or leave, or when a control value changes.',
    multiple: false,
    color: 'violet',
    parameters: [
      {
        name: 'start',
        type: 'onChangeStart',
        description: 'One of canAlwaysStart, canNeverRestart, canOnlyStartOnFirstRun.',
        defaultValue: 'canAlwaysStart',
      },
      {
        name: 'allocate',
        type: 'onChangeAllocate',
        description: 'A list of all enabled allocate options, from: moveToPreferred, stayInPrevious, moveToAllowedNotPrevious, moveToAllowed.',
        defaultValue: ['moveToPreferred', 'stayInPrevious', 'moveToAllowedNotPrevious', 'moveToAllowed'],
      },
    ],
  },
];

export default behaviourTypes;
