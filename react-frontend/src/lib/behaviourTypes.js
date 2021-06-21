export const behaviourTypes = [
  // Controls - are generated dynamically and added to the start of the list in lib/Behaviours.js
  // Fixed
  'fixedDevices',
  'fixedSpread',
  // Custom
  'preferredIf',
  'allowedIf',
  'prohibitedIf',
  'gainAdjustmentIf',
  'exclusive',
  'onChange',
  // Not supported anymore; replaced by fixed/presets
  // 'mainDeviceOnly',
  // 'auxDevicesOnly',
  // 'allowedEverywhere',
  // 'spread',
  'muteIf',
  'imageEffects',
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
    additive: true,
  },
  spread: {
    displayName: 'spread',
    description: 'The object will be allocated to all devices it is allowed in after all behaviours have been taken into account.',
    multiple: false,
    color: 'teal',
    parameters: [
      {
        name: 'perDeviceGainAdjust',
        displayName: 'Gain adjustment based on number of devices',
        description: 'When the object is in multiple devices, multiply its gain by this value for each additional device it is in beyond the first one; applies the same adjustment to every device.',
        type: 'gain',
        defaultValue: 0.0,
      },
    ],
  },
  preferredIf: {
    displayName: 'Preferred if',
    description: 'Any device that fulfils all of the conditions added to this behaviour will be preferred for this object.',
    multiple: true,
    color: 'green',
    parameters: [
      {
        name: 'conditions',
        displayName: 'Conditions',
        description: '',
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  allowedIf: {
    displayName: 'Allowed if',
    description: 'The object will be allowed on any device that fulfils all of the conditions added to this behaviour.',
    multiple: true,
    color: 'yellow',
    additive: true, // Additive means that this behaviour replaces the implicit allowedEverywhere.
    parameters: [
      {
        name: 'conditions',
        displayName: 'Conditions',
        description: '',
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  prohibitedIf: {
    displayName: 'Prohibited if',
    description: 'The object will be prohibited on any device that fulfils all of the conditions added to this behaviour.',
    multiple: true,
    color: 'red',
    parameters: [
      {
        name: 'conditions',
        displayName: 'Conditions',
        description: '',
        type: 'conditionsList',
        defaultValue: [],
      },
    ],
  },
  gainAdjustmentIf: {
    displayName: 'Gain adjustment if',
    description: 'The gain of this object will be adjusted on any device to which it is currently allocated that fulfils all of the conditions added to this behaviour',
    multiple: true,
    color: 'teal',
    parameters: [
      {
        name: 'gainAdjust',
        displayName: 'Gain adjustment',
        description: 'Adjust the object\'s gain by this value on each device that matches the conditions.',
        type: 'gain',
        defaultValue: 0.0,
      },
      {
        name: 'conditions',
        displayName: 'Conditions',
        description: '',
        type: 'conditionsList',
        defaultValue: [],
      },

    ],
  },
  exclusive: {
    displayName: 'Exclusive',
    description: 'The object will be the only one allowed in a device. It won\'t be allowed into a device that\'s already been allocated one or more objects, and it won\'t let subsequent objects be allocated to the same device.',
    multiple: false,
    color: 'pink',
  },
  onChange: {
    displayName: 'Change management',
    description: 'Determines what happens to the object when devices join or leave, or when a control value changes.',
    multiple: false,
    color: 'violet',
    parameters: [
      {
        name: 'start',
        displayName: 'When can the object start?',
        type: 'enum',
        description: 'Determines when the object can start playing.',
        defaultValue: 'canAlwaysStart',
        allowedValues: [
          { value: 'canAlwaysStart', displayName: 'Can always start' },
          { value: 'canNeverStart', displayName: 'Can never restart' },
          { value: 'canOnlyStartOnFirstRun', displayName: 'Can only start at the beginning of the sequence' },
        ],
      },
      {
        name: 'allocate',
        displayName: 'When can the object move?',
        type: 'listOfEnum',
        description: 'Determines when the object can or should move to another device.',
        defaultValue: ['moveToPreferred', 'stayInPrevious', 'moveToAllowedNotPrevious', 'moveToAllowed'],
        allowedValues: [
          { value: 'moveToPreferred', displayName: 'Move to more preferred device' },
          { value: 'stayInPrevious', displayName: 'Stay in previous device' },
          { value: 'moveToAllowedNotPrevious', displayName: 'Move to allowed device (can\'t stay in previous device)' },
          { value: 'moveToAllowed', displayName: 'Move to any allowed device' },
        ],
      },
    ],
  },
  fixedDevices: {
    displayName: 'Device roles',
    description: 'Determines which device roles the object can be allocated to (main, aux, or either).',
    fixed: true,
    color: 'grey',
    parameters: [
      {
        name: 'deviceType',
        type: 'enum',
        description: '',
        defaultValue: 'any',
        allowedValues: [
          { value: 'any', displayName: 'Any device role' },
          { value: 'main', displayName: 'Main device only' },
          { value: 'aux', displayName: 'Aux devices only' },
        ],
      },
    ],
  },
  fixedSpread: {
    displayName: 'How many devices',
    description: 'Determines how many devices the object can be allocated to.',
    fixed: true,
    color: 'grey',
    parameters: [
      {
        name: 'spread',
        type: 'enum',
        description: '',
        defaultValue: 'doNotSpread',
        allowedValues: [
          { value: 'doNotSpread', displayName: 'One device only' },
          { value: 'spread', displayName: 'All applicable devices' },
          { value: 'spreadWithSmallGainReduction', displayName: 'All applicable with gain reduction' },
        ],
      },
    ],
  },
  muteIf: {
    displayName: 'Mute if',
    description: 'The object will be muted if the reference object is currently allocated to a device.',
    color: 'purple',
    parameters: [
      {
        displayName: 'Reference object',
        name: 'objectId',
        type: 'object',
        description: '',
        defaultValue: 'NONE', // Have to have a default that's a string but not a valid objectId
      },
    ],
    multiple: true,
  },
  imageEffects: {
    displayName: 'Images and effects',
    description: 'Display timed images and animated lighting effects on devices this object is allocated to.',
    color: 'olive',
    multiple: false,
    parameters: [
      {
        // TODO: have to have a parameter to enable editing the behaviour, but a custom dialogue is
        // used instead of the behaviour parameters modal, so the description of the parameter does
        // not matter.
        displayName: 'Items',
        name: 'items',
        type: 'imageItems',
        description: 'Each item specifies a time range. After adding an item, click the placeholders to configure the image or effect.',
        defaultValue: [],
      },
    ],
  },
};

export const deviceTypes = [
  { value: 'desktop', displayName: 'Desktop/laptop', icon: 'desktop' },
  { value: 'mobile', displayName: 'Mobile', icon: 'mobile' },
  { value: 'tablet', displayName: 'Tablet', icon: 'tablet alternate' },
  // { value: 'tv', displayName: 'TV' },
];
