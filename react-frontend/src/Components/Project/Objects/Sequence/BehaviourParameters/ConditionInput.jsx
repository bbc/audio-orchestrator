import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  Button,
  Segment,
  Checkbox,
  List,
  Input,
} from 'semantic-ui-react';

// TODO sessionProperties don't yet have a schema; implementation is here:
// bbcat-orchestration/blob/master/src/mdo-allocation/mdo-allocator.js
const sessionProperties = [
  {
    name: 'currentContentId',
    type: 'string', // TODO: actually represents a sequence id
  },
  {
    name: 'numDevices',
    type: 'integer',
  },
];

// TODO define deviceProperties in a separate file, and automatically generate it from the schema
// As specified in bbcat-orchestration/schemas/device.json
const deviceProperties = [
  {
    name: 'deviceId',
    displayName: 'deviceId',
    description: 'Unique identifier for this device, automatically generated',
    type: 'string',
  },
  {
    name: 'deviceIsMain',
    displayName: 'deviceIsMain',
    description: 'True if this device is the main device (the device that manages playback and allocations)',
    type: 'boolean',
  },
  {
    name: 'deviceType',
    displayName: 'deviceType',
    description: 'Device type as detected by the application',
    type: 'string',
  },
  {
    name: 'deviceJoiningNumber',
    displayName: 'deviceJoiningNumber',
    description: 'Original position in the joining order, 1-based',
    type: 'integer',
  },
  {
    name: 'deviceCurrentNumber',
    displayName: 'deviceCurrentNumber',
    description: 'Current position in the joining order, 1-based',
    type: 'integer',
  },
  {
    name: 'deviceLatency',
    displayName: 'deviceLatency',
    description: 'Emission delay, in milliseconds, if known',
    type: 'integer',
  },
  {
    name: 'deviceGain',
    displayName: 'deviceGain',
    description: 'Calibration gain multiplier to be applied to the output from the device, if known',
    type: 'number',
  },
];

// Based on bbcat-orchestration/src/allocation-algorithm/behaviours/conditionals.js
const operators = [
  {
    name: 'equals',
    valueIsArray: false,
  },
  {
    name: 'lessThan',
    valueIsArray: false,
  },
  {
    name: 'lessThanOrEqual',
    valueIsArray: false,
  },
  {
    name: 'greaterThan',
    valueIsArray: false,
  },
  {
    name: 'greaterThanOrEqual',
    valueIsArray: false,
  },
  {
    name: 'anyOf',
    valueIsArray: true,
  },
  {
    name: 'moduloIsZero',
    valueIsArray: false,
  },
];

const operatorOptions = operators.map(({ name, displayName }) => ({
  key: name,
  text: displayName || name,
  value: name,
}));

class ConditionInput extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      customValues: [],
    };

    this.handleCustomValueAddition = this.handleCustomValueAddition.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleCustomValueAddition(e, data) {
    const { customValues } = this.state;
    const { value } = data;

    if (!customValues.includes(value)) {
      this.setState({
        customValues: [
          ...customValues,
          value,
        ],
      });
    }
  }

  handleChange(e, data) {
    // get the current value representing the entire condition
    const { value, onChange } = this.props;

    // extract name of input field and its current value - or checked property
    const {
      name: fieldName,
      value: fieldValue,
      checked,
    } = data;

    const newValue = {
      ...value,
      [fieldName]: fieldName === 'invertCondition' ? checked : fieldValue,
    };

    // if the operator was changed and the value should now be an array (or not anymore), convert
    // by taking the first element of an array or creating a 1-element array.
    if (fieldName === 'operator') {
      const { valueIsArray } = operators.find(o => o.name === fieldValue) || {};
      const v = fieldValue;
      if (valueIsArray) {
        newValue.value = Array.isArray(v) ? v : [v];
      } else {
        newValue.value = Array.isArray(v) ? v[0] : v;
      }
    }

    // pass the new value up to the parent component through the onChange handler
    onChange(e, {
      value: newValue,
    });
  }

  render() {
    const {
      value,
      onDelete,
      controls,
    } = this.props;

    const {
      property,
      invertCondition,
      operator,
      value: conditionValue,
    } = value;

    const {
      customValues,
    } = this.state;

    const propertyOptions = [
      ...controls.map(({ controlId, controlName }) => ({
        key: `deviceControls.${controlId}`,
        value: `deviceControls.${controlId}`,
        text: controlName,
        description: 'control',
        label: {
          color: 'violet',
          size: 'tiny',
          empty: true,
          circular: true,
        },
      })),
      ...deviceProperties.map(({ name, displayName }) => ({
        key: `device.${name}`,
        value: `device.${name}`,
        text: displayName || name,
        description: 'device',
        label: {
          color: 'purple',
          size: 'tiny',
          empty: true,
          circular: true,
        },
      })),
      ...sessionProperties.map(({ name, displayName }) => ({
        key: `session.${name}`,
        value: `session.${name}`,
        text: displayName || name,
        description: 'session',
        label: {
          color: 'teal',
          size: 'tiny',
          empty: true,
          circular: true,
        },
      })),
    ];

    const { valueIsArray } = operators.find(o => o.name === operator) || {};

    const customValueOptions = valueIsArray ? [
      ...new Set([
        ...customValues,
        ...(Array.isArray(conditionValue) ? conditionValue : [conditionValue]),
      ]),
    ].map(v => ({
      key: v,
      value: v,
      text: v,
    })) : [];

    return (
      <Segment>
        Condition
        <Button icon="trash" floated="right" basic size="tiny" compact onClick={onDelete} />
        <List>
          <List.Item>
            <Dropdown
              fluid
              selection
              search
              labeled
              placeholder="Property"
              options={propertyOptions}
              value={property}
              name="property"
              onChange={this.handleChange}
            />
          </List.Item>
          <List.Item>
            <Dropdown
              fluid
              selection
              placeholder="Operator"
              options={operatorOptions}
              value={operator}
              name="operator"
              onChange={this.handleChange}
            />
          </List.Item>
          <List.Item>
            { valueIsArray
              ? (
                <Dropdown
                  fluid
                  multiple
                  selection
                  search
                  allowAdditions
                  placeholder="Value"
                  value={conditionValue || []}
                  name="value"
                  options={customValueOptions}
                  onAddItem={this.handleCustomValueAddition}
                  onChange={this.handleChange}
                />
              )
              : (
                <Input
                  disabled={operator === undefined}
                  fluid
                  placeholder="Value"
                  value={conditionValue || ''}
                  name="value"
                  onChange={this.handleChange}
                />
              )}
          </List.Item>
        </List>
        <Checkbox
          label="Invert condition"
          checked={invertCondition}
          name="invertCondition"
          onChange={this.handleChange}
        />
      </Segment>
    );
  }
}

ConditionInput.propTypes = {
  value: PropTypes.shape({
    property: PropTypes.string,
    invertCondition: PropTypes.bool,
    operator: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.shape({})),
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.arrayOf(PropTypes.number),
    ]),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
};

// TODO dummy control data, because builder does not store controls in the new format yet.
ConditionInput.defaultProps = {
  controls: [
    { controlId: 'control-1', controlName: 'Control 1' },
    { controlId: 'control-2', controlName: 'Control 2' },
  ],
};

export default ConditionInput;
