import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Input,
  Header,
  Label,
} from 'semantic-ui-react';

class RangeControlSettings extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, data) {
    const {
      onChange,
      parameters,
      defaultValues,
    } = this.props;

    const {
      name: inputName,
      value: inputValue,
      type: inputType,
    } = data;

    const value = ['number', 'range'].includes(inputType) ? parseFloat(inputValue) : inputValue;

    if (inputName === 'defaultValue') {
      onChange('controlDefaultValues', [value]);
    } else {
      onChange('controlParameters', {
        ...parameters,
        [inputName]: value,
      });

      // enforce default value to be within min/max bounds
      if (inputName === 'min' && !Number.isNaN(value)) {
        const { max } = parameters;
        const min = value;
        onChange('controlDefaultValues', [
          Math.min(max, Math.max(defaultValues[0], min)),
        ]);
      } else if (inputName === 'max' && !Number.isNaN(value)) {
        const { min } = parameters;
        const max = value;
        onChange('controlDefaultValues', [
          Math.min(max, Math.max(defaultValues[0], min)),
        ]);
      }
    }
  }

  render() {
    const {
      parameters,
      defaultValues,
    } = this.props;

    const defaultValue = defaultValues[0] || 0;
    const {
      step,
      min,
      max,
    } = parameters;

    return (
      <Card.Content>
        <Header content="Range" subheader="The end points of the slider (minimum and maximum values)." />
        <Input
          type="number"
          placeholder="Minimum"
          name="min"
          value={min}
          error={Number.isNaN(min) || min > max}
          onChange={this.handleChange}
        />
        {' '}
        <Input
          type="number"
          placeholder="Maximum"
          name="max"
          value={max}
          error={Number.isNaN(max) || min > max}
          onChange={this.handleChange}
        />

        <Header content="Step size" subheader="The smallest incremental change that can be made by moving the slider." />
        <Input
          type="number"
          placeholder="Step size"
          min="0"
          name="step"
          value={step}
          error={Number.isNaN(step) || step <= 0}
          onChange={this.handleChange}
        />

        <Header content="Default value" subheader="The initial value of the control." />
        <Input
          type="range"
          placeholder="Default value"
          name="defaultValue"
          min={min}
          max={max}
          step={step}
          value={defaultValue}
          onChange={this.handleChange}
        />
        <Label pointing="left" content={defaultValue} />
      </Card.Content>
    );
  }
}

RangeControlSettings.propTypes = {
  parameters: PropTypes.shape({
    step: PropTypes.number.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
  }).isRequired,
  defaultValues: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
  // controlType: PropTypes.oneOf(['range']).isRequired,
};

export default RangeControlSettings;
