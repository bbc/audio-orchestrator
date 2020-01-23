const controlTypes = [
  {
    name: 'radio',
    displayName: 'Radio buttons',
    description: 'Select a single value from the set of options.',
    icon: 'radio',
    parameters: [
      {
        name: 'options',
        defaultValue: [],
      },
    ],
  },
  {
    name: 'checkbox',
    displayName: 'Checkboxes',
    description: 'Select none, one, or multiple values from the list of options.',
    icon: 'check square',
    parameters: [
      {
        name: 'options',
        defaultValue: [],
      },
    ],
  },
  {
    name: 'range',
    displayName: 'Range',
    description: 'Select a number between a maximum and minimum value by moving a slider.',
    icon: 'sliders',
    parameters: [
      {
        name: 'min',
        defaultValue: 0,
      },
      {
        name: 'max',
        defaultValue: 100,
      },
      {
        name: 'step',
        defaultValue: 1,
      },
    ],
  },
  {
    name: 'coordinate',
    displayName: 'Coordinates',
    description: 'Select an x-y coordinate pair on a two-dimensional map.',
    icon: 'map',
    parameters: [
      {
        name: 'xMin',
        defaultValue: -1,
      },
      {
        name: 'xMax',
        defaultValue: 1,
      },
      {
        name: 'xStep',
        defaultValue: 0.1,
      },
      {
        name: 'yMin',
        defaultValue: -1,
      },
      {
        name: 'yMax',
        defaultValue: 1,
      },
      {
        name: 'yStep',
        defaultValue: 0.1,
      },
    ],
  },
  {
    name: 'text',
    displayName: 'Text',
    decription: 'Enter free text.',
    icon: 'text cursor',
    parameters: [
      {
        name: 'length',
        defaultValue: 32,
      },
    ],
  },
  {
    name: 'counter',
    displayName: 'Counter button',
    description: 'Increment or decrement a number by clicking a button.',
    icon: 'plus square',
    parameters: [
      {
        name: 'label',
        defaultValue: 'Click me',
      },
      {
        name: 'step',
        defaultValue: 1,
      },
    ],
  },
];

export default controlTypes;
