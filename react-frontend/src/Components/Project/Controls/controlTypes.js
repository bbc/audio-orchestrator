/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/// Removed type names used previously: coordinate, text.
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
