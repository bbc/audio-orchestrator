const controlTypes = [
  {
    name: 'radio',
    displayName: 'Radio buttons',
    description: 'Select a single value from the set of options.',
    icon: 'radio',
  },
  {
    name: 'checkbox',
    displayName: 'Checkboxes',
    description: 'Select none, one, or multiple values from the list of options.',
    icon: 'check square',
  },
  {
    name: 'range',
    displayName: 'Range',
    description: 'Select a number between a maximum and minimum value by moving a slider.',
    icon: 'sliders',
  },
  {
    name: 'coordinate',
    displayName: 'Coordinates',
    description: 'Select an x-y coordinate pair on a two-dimensional map.',
    icon: 'map',
  },
  {
    name: 'text',
    displayName: 'Text',
    decription: 'Enter free text.',
    icon: 'text cursor',
  },
  {
    name: 'counter',
    displayName: 'Counter button',
    description: 'Increment or decrement a number by clicking a button.',
    icon: 'plus square',
  },
];

export default controlTypes;
