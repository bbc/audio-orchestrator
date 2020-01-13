// TODO: This file needs refactoring.
// TODO: Check current operator is allowed by condition property
// TODO: Rework the allowedoperator DOM property
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
import operators from './operators';
import deviceProperties from './deviceProperties';
import sessionProperties from './sessionProperties';
import EnumInput from '../EnumInput';
import ListOfEnumInput from '../ListOfEnumInput';

const operatorOptions = operators.map(({ name, displayName }) => ({
  key: name,
  text: displayName,
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
      const v = newValue.value;
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
      sequencesList,
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
      ...controls.map(({ controlId, controlName, allowedOperators }) => ({
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
        allowedoperators: allowedOperators,
        type: 'string',
      })),
      ...deviceProperties.map(({
        name, displayName, type, allowedOperators,
      }) => ({
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
        allowedoperators: allowedOperators,
        type,
      })),
      ...sessionProperties.map(({
        name, displayName, type, allowedOperators,
      }) => ({
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
        allowedoperators: allowedOperators,
        type,
      })),
    ];

    const { valueIsArray } = operators.find(o => o.name === operator) || {};

    const sequences = sequencesList.map(({ sequenceId, name }) => ({
      value: sequenceId,
      displayName: name,
    }));

    const { type, allowedoperators } = propertyOptions.find(p => p.value === property) || {};

    const valueIsSequence = type === 'sequenceId';

    let filteredOperatorOptions = operatorOptions;

    if (allowedoperators) {
      filteredOperatorOptions = operatorOptions.filter(o => allowedoperators.includes(o.value));
    }

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

    let valueInputComponent = (
      <Input
        disabled={operator === undefined}
        fluid
        placeholder="Value"
        value={conditionValue || ''}
        name="value"
        onChange={this.handleChange}
      />
    );
    if (valueIsSequence) {
      if (valueIsArray) {
        valueInputComponent = (
          <ListOfEnumInput
            allowedValues={sequences}
            value={conditionValue || []}
            onChange={this.handleChange}
            name="value"
          />
        );
      } else {
        valueInputComponent = (
          <EnumInput
            allowedValues={sequences}
            value={conditionValue || ''}
            onChange={this.handleChange}
            name="value"
          />
        );
      }
    } else if (valueIsArray) {
      valueInputComponent = (
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
      );
    }

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
              options={filteredOperatorOptions}
              value={operator}
              name="operator"
              onChange={this.handleChange}
            />
          </List.Item>
          <List.Item>
            { valueInputComponent }
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
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
};

// TODO dummy control data, because builder does not store controls in the new format yet.
ConditionInput.defaultProps = {
  controls: [
    { controlId: 'control-1', controlName: 'Control 1' },
    { controlId: 'control-2', controlName: 'Control 2' },
  ],
};

export default ConditionInput;
