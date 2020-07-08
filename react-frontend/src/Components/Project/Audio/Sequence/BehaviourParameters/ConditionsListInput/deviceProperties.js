/* eslint-disable max-len */
// As specified in bbcat-orchestration/schemas/device.json
const deviceProperties = [
  {
    name: 'deviceIsMain',
    displayName: 'Main device',
    description: 'True if this device is the main device (the device that manages playback and allocations)',
    type: 'bool',
  },
  {
    name: 'deviceType',
    displayName: 'Device type',
    description: 'Device type as detected by the application',
    type: 'deviceType',
  },
  {
    name: 'deviceJoiningNumber',
    displayName: 'Joining number',
    description: 'Original position in the joining order, 1-based',
    type: 'number',
  },
  {
    name: 'deviceCurrentNumber',
    displayName: 'Current number',
    description: 'Current position in the joining order, 1-based',
    type: 'number',
  },
  {
    name: 'objectIds',
    displayName: 'Objects allocated to same device',
    description: 'Any of the objects that have been allocated to the device so far, up to the current object',
    type: 'object',
  },
];

export default deviceProperties;
