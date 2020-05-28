// Removed type names used previously: coordinate, text.
const controlTypes = [
  {
    name: 'radio',
    displayName: 'Radio buttons',
    description: 'the listener can select a single option.',
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
    description: 'the listener can select one or more options.',
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
    description: 'the listener can select a number by moving a slider.',
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
    displayName: 'Button',
    description: 'the listener can increment or decrement a counter by clicking a button.',
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
