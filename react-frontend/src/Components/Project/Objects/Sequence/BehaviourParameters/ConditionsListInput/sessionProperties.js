// TODO sessionProperties don't yet have a schema; implementation is here:
// bbcat-orchestration/blob/master/src/mdo-allocation/mdo-allocator.js
const sessionProperties = [
  {
    name: 'currentContentId',
    displayName: 'Current sequence',
    type: 'string', // TODO: actually represents a sequence id
  },
  {
    name: 'numDevices',
    displayName: 'Number of devices',
    type: 'integer',
  },
];

export default sessionProperties;
