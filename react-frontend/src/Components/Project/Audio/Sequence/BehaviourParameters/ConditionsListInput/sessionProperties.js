// sessionProperties don't yet have a schema; implementation is here:
// bbcat-orchestration/blob/master/src/mdo-allocation/mdo-allocator.js
const sessionProperties = [
  {
    name: 'numDevices',
    displayName: 'Number of devices currently connected',
    type: 'number',
  },
  {
    name: 'objectIds',
    displayName: 'Objects allocated to any device',
    description: 'List of objects that have been allocated to any device so far, up to but not including the current object',
    type: 'object',
  },
];

export default sessionProperties;
