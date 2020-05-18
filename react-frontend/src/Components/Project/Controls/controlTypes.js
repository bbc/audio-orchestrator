// Removed type names used previously: coordinate, text.
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
