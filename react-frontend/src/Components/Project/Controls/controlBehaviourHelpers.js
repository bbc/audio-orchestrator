const DEVICE_PROPERTY = 'device.deviceIsMain';
const CONTENT_ID_PROPERTY = 'session.currentContentId';

const MAIN_DEVICE_ONLY = 'main';
const OTHER_DEVICES_ONLY = 'other';
const ALL_DEVICES = 'all';

export const devicesOptions = [
  {
    value: ALL_DEVICES,
    displayName: 'All devices',
  },
  {
    value: MAIN_DEVICE_ONLY,
    displayName: 'Main device only',
  },
  {
    value: OTHER_DEVICES_ONLY,
    displayName: 'Other devices only',
  },
];

// Find the condition in the behaviour that has the expected property
const conditionByProperty = (behaviour = {}, p) => {
  const { behaviourParameters = {} } = behaviour;
  const { conditions = [] } = behaviourParameters;
  return conditions.find(({ property }) => property === p);
};

// Find the value of the condition that thas the expected property
const conditionValueByProperty = (behaviour = {}, property) => (
  (conditionByProperty(behaviour, property) || {}).value
);

// Find the first allowedIf behaviour
const getAllowedIfBehaviour = behaviours => behaviours
  .find(({ behaviourType }) => behaviourType === 'allowedIf');

// Create a new behaviour list; replacing the allowedIf behaviour with one that has an updated list
// of allowed deviceIsMain flags.
export const makeBehavioursWithAllowedDevices = (behaviours, devicesAllowed) => {
  // first find the allowedIf behaviour to edit and get the contentId and device conditions in it
  const behaviour = getAllowedIfBehaviour(behaviours);
  const contentIdCondition = conditionByProperty(behaviour, CONTENT_ID_PROPERTY);
  const deviceCondition = conditionByProperty(behaviour, DEVICE_PROPERTY);

  // create the array of isMainDevice values to be allowed
  let value;
  switch (devicesAllowed) {
    case MAIN_DEVICE_ONLY:
      value = [true];
      break;
    case OTHER_DEVICES_ONLY:
      value = [false];
      break;
    default:
      value = [true, false];
  }

  // return a new behaviour list, leaving the other behaviours and the contentId condition unchanged
  return [
    ...behaviours.filter(({ behaviourId }) => behaviourId !== behaviour.behaviourId),
    {
      behaviourId: behaviour.behaviourId,
      behaviourType: 'allowedIf',
      behaviourParameters: {
        conditions: [
          contentIdCondition,
          {
            conditionId: deviceCondition.conditionId,
            property: DEVICE_PROPERTY,
            operator: 'anyOf',
            value,
            invertCondition: false,
          },
        ],
      },
    },
  ];
};

// Create a new behaviour list; replacing the allowedIf behaviour with one that has an updated list
// of disallowed sequenceIds.
export const makeBehavioursWithDisallowedSequenceIds = (behaviours, disallowedSequenceIds) => {
  // first find the allowedIf behaviour to edit get the contendId and device conditions in it
  const behaviour = getAllowedIfBehaviour(behaviours);
  const contentIdCondition = conditionByProperty(behaviour, CONTENT_ID_PROPERTY);
  const deviceCondition = conditionByProperty(behaviour, DEVICE_PROPERTY);

  // create a new behaviour list, leaving the other behaviours and the devices condition unchanged
  return [
    ...behaviours.filter(({ behaviourId }) => behaviourId !== behaviour.behaviourId),
    {
      behaviourId: behaviour.behaviourId,
      behaviourType: 'allowedIf',
      behaviourParameters: {
        conditions: [
          deviceCondition,
          {
            conditionId: contentIdCondition.conditionId,
            property: CONTENT_ID_PROPERTY,
            operator: 'anyOf',
            value: disallowedSequenceIds,
            invertCondition: true,
          },
        ],
      },
    },
  ];
};

// Get the flag describing which deviceIsMain values are allowed by the behaviours
export const getDevicesAllowed = (behaviours) => {
  const behaviour = getAllowedIfBehaviour(behaviours);

  // Determine whether all, the main device only, or other devices only are allowed
  const mainDeviceAllowedList = conditionValueByProperty(behaviour, DEVICE_PROPERTY) || [];
  const mainDeviceAllowed = mainDeviceAllowedList.includes(true);
  const otherDevicesAllowed = mainDeviceAllowedList.includes(false);

  let devicesAllowed = ALL_DEVICES;

  if (!mainDeviceAllowed) {
    devicesAllowed = OTHER_DEVICES_ONLY;
  } else if (!otherDevicesAllowed) {
    devicesAllowed = MAIN_DEVICE_ONLY;
  }

  return devicesAllowed;
};

// Get a list of sequenceIds not disallowed by the behaviours.
export const getSequenceIdsAllowed = (behaviours, sequencesList) => {
  const behaviour = getAllowedIfBehaviour(behaviours);

  // Get a list of sequenceIds that are disallowed, and then create the opposite of it
  const disallowedSequenceIds = conditionValueByProperty(behaviour, CONTENT_ID_PROPERTY) || [];
  return sequencesList
    .filter(({ sequenceId }) => !disallowedSequenceIds.includes(sequenceId))
    .map(({ sequenceId }) => sequenceId);
};
