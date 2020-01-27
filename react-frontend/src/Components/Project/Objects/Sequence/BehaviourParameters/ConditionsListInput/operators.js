// Based on bbcat-orchestration/src/allocation-algorithm/behaviours/conditionals.js
const operators = [
  {
    name: 'equals',
    displayName: 'Equal to',
    valueIsArray: false,
    allowedTypes: ['number', 'string', 'enum'],
  },
  {
    name: 'lessThan',
    displayName: 'Less than',
    valueIsArray: false,
    allowedTypes: ['number', 'string'],
  },
  {
    name: 'lessThanOrEqual',
    displayName: 'Less than or equal to',
    valueIsArray: false,
    allowedTypes: ['number', 'string'],
  },
  {
    name: 'greaterThan',
    displayName: 'Greater than',
    valueIsArray: false,
    allowedTypes: ['number', 'string'],
  },
  {
    name: 'greaterThanOrEqual',
    displayName: 'Greater than or equal to',
    valueIsArray: false,
    allowedTypes: ['number', 'string'],
  },
  {
    name: 'anyOf',
    displayName: 'Any of',
    valueIsArray: true,
    allowedTypes: ['number', 'string', 'enum'],
  },
  {
    name: 'moduloIsZero',
    displayName: 'Modulo is zero',
    valueIsArray: false,
    allowedTypes: ['number'],
  },
];

export default operators;
