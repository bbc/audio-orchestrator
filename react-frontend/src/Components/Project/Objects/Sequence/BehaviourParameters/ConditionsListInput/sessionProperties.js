// sessionProperties don't yet have a schema; implementation is here:
// bbcat-orchestration/blob/master/src/mdo-allocation/mdo-allocator.js
const sessionProperties = [
  {
    name: 'numDevices',
    displayName: 'Number of devices currently connected',
    type: 'number',
  },
];

export default sessionProperties;
