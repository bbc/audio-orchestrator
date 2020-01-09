// TODO automatically generate it from the schema
// As specified in bbcat-orchestration/schemas/device.json
const deviceProperties = [
  {
    name: 'deviceId',
    displayName: 'ID',
    description: 'Unique identifier for this device, automatically generated',
    type: 'string',
  },
  {
    name: 'deviceIsMain',
    displayName: 'Main Device',
    description: 'True if this device is the main device (the device that manages playback and allocations)',
    type: 'boolean',
  },
  {
    name: 'deviceType',
    displayName: 'Type',
    description: 'Device type as detected by the application',
    type: 'string',
  },
  {
    name: 'deviceJoiningNumber',
    displayName: 'Joining number',
    description: 'Original position in the joining order, 1-based',
    type: 'integer',
  },
  {
    name: 'deviceCurrentNumber',
    displayName: 'Current Number',
    description: 'Current position in the joining order, 1-based',
    type: 'integer',
  },
  {
    name: 'deviceLatency',
    displayName: 'Latency',
    description: 'Emission delay, in milliseconds, if known',
    type: 'integer',
  },
  {
    name: 'deviceGain',
    displayName: 'Gain',
    description: 'Calibration gain multiplier to be applied to the output from the device, if known',
    type: 'number',
  },
];

export default deviceProperties;
