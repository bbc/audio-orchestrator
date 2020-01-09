// Based on bbcat-orchestration/src/allocation-algorithm/behaviours/conditionals.js
const operators = [
  {
    name: 'equals',
    displayName: 'Equal to',
    valueIsArray: false,
  },
  {
    name: 'lessThan',
    displayName: 'Less than',
    valueIsArray: false,
  },
  {
    name: 'lessThanOrEqual',
    displayName: 'Less than or equal to',
    valueIsArray: false,
  },
  {
    name: 'greaterThan',
    displayName: 'Greater than',
    valueIsArray: false,
  },
  {
    name: 'greaterThanOrEqual',
    displayName: 'Greater than or equal to',
    valueIsArray: false,
  },
  {
    name: 'anyOf',
    displayName: 'Any of',
    valueIsArray: true,
  },
  {
    name: 'moduloIsZero',
    displayName: 'Modulo is zero',
    valueIsArray: false,
  },
];

export default operators;
