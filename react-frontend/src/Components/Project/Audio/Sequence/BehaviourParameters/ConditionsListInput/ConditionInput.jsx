// TODO anyOf does not allow inputting numbers as not-strings (but that should be fine because they
// are compared with ==)
import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  Segment,
  Checkbox,
  List,
  Input,
  Button,
} from 'semantic-ui-react';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import { deviceTypes } from 'Lib/behaviourTypes';
import operators from './operators';
import deviceProperties from './deviceProperties';
import sessionProperties from './sessionProperties';
import EnumInput from '../EnumInput';
import ListOfEnumInput from '../ListOfEnumInput';
import ListOfEnumWithAdditionInput from '../ListOfEnumWithAdditionInput';
import ModuloInput from '../ModuloInput';

const operatorOptions = operators.map(({ name, displayName }) => ({
  key: name,
  text: displayName,
  value: name,
}));

const propertyGroupInfo = {
  deviceControls: {
    color: 'orange',
    displayName: 'Device controls metadata',
  },
  device: {
    color: 'purple',
    displayName: 'Device metadata',
  },
  session: {
    color: 'teal',
    displayName: 'Session metadata',
  },
};

const makePropertyOption = (group, value, displayName) => ({
  key: `${group}.${value}`,
  value: `${group}.${value}`,
  text: displayName || value,
  description: propertyGroupInfo[group].displayName,
  label: {
    color: propertyGroupInfo[group].color,
    size: 'tiny',
    empty: true,
    circular: true,
  },
});

const devicePropertyOptions = deviceProperties.map(({
  name, displayName,
}) => makePropertyOption('device', name, displayName));

const sessionPropertyOptions = sessionProperties.map(({
  name, displayName,
}) => makePropertyOption('session', name, displayName));

const getPropertyOptions = controls => [
  ...controls.map(({
    controlId, controlName,
  }) => makePropertyOption('deviceControls', controlId, controlName)),
  ...devicePropertyOptions,
  ...sessionPropertyOptions,
];

const getPropertyTypeAndOperators = (property, {
  controls = [],
  sequencesList = [],
  objectsList = [],
}) => {
  const [group, name] = property.split('.');
  const propertyLists = {
    device: deviceProperties,
    session: sessionProperties,
    deviceControls: controls,
  };

  const {
    type,
    controlType,
    controlParameters,
  } = propertyLists[group].find(p => p.name === name || p.controlId === name) || {};
  // TODO adding the || {} avoids a crash if the required control does not exist, but still
  // displays bogus empty data.

  let result = {
    type,
    allowedValues: [],
    allowedOperators: [],
  };

  // Controls don't have type or allowedOperator values, so generate those per controlType:
  if (group === 'deviceControls') {
    switch (controlType) {
      case 'radio':
      case 'checkbox':
        result = {
          type: 'enum',
          allowedValues: controlParameters.options.map(o => ({
            value: o.value,
            displayName: o.label,
          })),
        };
        break;
      case 'range':
      case 'counter':
        result = {
          type: 'number',
        };
        break;
      default:
        console.log(`treating unhandled controlType ${controlType} as having a simple string value.`);
        result = {
          type: 'string',
        };
        break;
    }
  }

  if (result.type === 'sequence') {
    // If the type is 'sequence', generate allowedValues from the given sequencesList, and reset
    // type to 'enum'.
    result.type = 'enum';
    result.allowedValues = sequencesList.map(({ sequenceId, name: sequenceName }) => ({
      value: sequenceId,
      displayName: sequenceName,
    }));
  } else if (result.type === 'object') {
    // If the type is 'object', generate allowedValues from the given objectsList, and reset
    // type to 'enum'.
    result.type = 'enum';
    result.allowedValues = objectsList.map(({ objectNumber, label }) => ({
      value: `${objectNumber}-${label}`,
      displayName: `${objectNumber}: ${label}`,
    }));
  } else if (result.type === 'bool') {
    // Do the same for 'bool', for now use an enum input with values for true and false
    result.type = 'enum';
    result.allowedValues = [
      { value: true, displayName: 'True' },
      { value: false, displayName: 'False' },
    ];
  } else if (result.type === 'deviceType') {
    // based on template use of bowser getPlatform().type values here:
    // https://github.com/lancedikson/bowser/blob/master/src/constants.js#L86
    result.type = 'enum';
    result.allowedValues = deviceTypes;
  }

  // Set allowedOperators based on the allowed types defined in operators.js
  result.allowedOperators = operators
    .filter(o => o.allowedTypes.includes(result.type))
    .map(o => o.name);

  return result;
};

class ConditionInput extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, data) {
    // get the current value representing the entire condition
    const { value, onChange } = this.props;

    // extract name of input field and its current value - or checked property
    const {
      type: fieldType,
      name: fieldName,
      value: fieldValue,
      checked,
    } = data;

    const newValue = {
      ...value,
      [fieldName]: fieldValue,
    };

    // convert value type based on input element type
    if (fieldType === 'checkbox') {
      newValue[fieldName] = checked;
    } else if (fieldType === 'number') {
      newValue[fieldName] = fieldValue === '-' ? '-' : parseFloat(fieldValue);
      if (Number.isNaN(newValue[fieldName])) {
        newValue[fieldName] = undefined;
      }
    }

    // if the property was changed, reset the operator and value
    if (fieldName === 'property' && newValue.property !== value.property) {
      newValue.operator = undefined;
      newValue.value = undefined;
    }

    // if the operator was changed, reset the value
    if (fieldName === 'operator' && newValue.operator !== value.operator) {
      newValue.value = undefined;
    }

    // pass the new value for the entire condition up through the onChange handler
    onChange(e, {
      value: newValue,
    });
  }

  render() {
    const {
      value,
      onDelete,
      controls,
      sequencesList,
      objectsList,
    } = this.props;

    const {
      property,
      invertCondition,
      operator,
      value: conditionValue,
    } = value;

    // 1. Select a property
    // 2. Once a property is selected, the operator selection is enabled.
    // 3. Once an operator is selected, the value input is enabled.

    // Get the list of property options.
    const propertyOptions = getPropertyOptions(controls);

    // If the property is set, get the filtered list of applicable operators.
    let operatorInputEnabled = false;
    let filteredOperatorOptions = [];
    let valueType = 'string';
    let valueAllowedValues = [];

    if (property) {
      const {
        type,
        allowedOperators,
        allowedValues,
      } = getPropertyTypeAndOperators(property, { controls, sequencesList, objectsList });

      // Save expected type of value for selecting the right input component once an operator has
      // also been chosen.
      valueType = type;
      valueAllowedValues = allowedValues;

      filteredOperatorOptions = operatorOptions.filter(o => allowedOperators.includes(o.value));
      operatorInputEnabled = true;
    }

    // If an operator is set, select the input component for the value.
    // By default, display a disabled, empty, text field regardless of value type, because the
    // value is reset anyway when a new property or operator is chosen.
    let ValueInputComponent = Input;
    const valueInputProps = {
      disabled: true,
      value: '',
      placeholder: 'Value',
    };

    if (property && operator) {
      valueInputProps.disabled = false;
      const { valueIsArray } = operators.find(o => o.name === operator) || {};

      if (valueIsArray) {
        valueInputProps.value = conditionValue !== undefined ? conditionValue : [];
        switch (valueType) {
          case 'enum':
            ValueInputComponent = ListOfEnumInput;
            valueInputProps.allowedValues = valueAllowedValues;
            break;
          case 'number':
          case 'string':
          default:
            ValueInputComponent = ListOfEnumWithAdditionInput;
            valueInputProps.allowedValues = [];
            break;
        }
      } else {
        valueInputProps.value = conditionValue !== undefined ? conditionValue : '';
        switch (valueType) {
          case 'enum':
            ValueInputComponent = EnumInput;
            valueInputProps.allowedValues = valueAllowedValues;
            break;
          case 'number':
            valueInputProps.type = 'number';
            if (operator === 'modulo') {
              ValueInputComponent = ModuloInput;
            }
            break;
          case 'string':
          default:
            valueInputProps.type = 'text';
            break;
        }
      }
    }

    return (
      <Segment>
        <Button.Group floated="right" basic size="tiny">
          <ConfirmDeleteButton type="condition" small onDelete={onDelete} />
        </Button.Group>
        Condition

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
              options={filteredOperatorOptions}
              value={operator || ''}
              name="operator"
              onChange={this.handleChange}
              disabled={!operatorInputEnabled}
            />
          </List.Item>
          <List.Item>
            <ValueInputComponent
              {...valueInputProps}
              fluid
              name="value"
              onChange={this.handleChange}
            />
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
    operator: PropTypes.string,
    value: PropTypes.oneOfType([
      PropTypes.shape({}),
      PropTypes.string,
      PropTypes.number,
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.shape({})),
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.arrayOf(PropTypes.bool),
    ]),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({
    controlId: PropTypes.string,
    controlName: PropTypes.string,
    controlType: PropTypes.string,
    controlParameters: PropTypes.shape({}),
  })).isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  objectsList: PropTypes.arrayOf(PropTypes.shape({
    objectNumber: PropTypes.number,
    label: PropTypes.string,
  })).isRequired,
};

export default ConditionInput;
