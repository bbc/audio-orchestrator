import React from 'react';

// Based on audio-orchestration-core/src/allocation-algorithm/behaviours/conditionals.js
const operators = [
  {
    name: 'equals',
    displayName: 'Equal to',
    valueIsArray: false,
    allowedTypes: ['number', 'string', 'enum', 'object'],
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
    allowedTypes: ['number', 'string', 'enum', 'object'],
  },
  {
    name: 'modulo',
    displayName: (
      <span>
        Every N
        <sup>th</sup>
        {' '}
        value
      </span>
    ),
    // technically the value is stored as an array of (modulus, remainder), but is treated as a pair
    // so a single 'value' edited with two input fields, rather than the multi-selection for arrays
    valueIsArray: false,
    allowedTypes: ['number'],
  },
];

export default operators;
