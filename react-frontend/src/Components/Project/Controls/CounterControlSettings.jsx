import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Input,
  Header,
} from 'semantic-ui-react';

class CounterControlSettings extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, data) {
    const {
      onChange,
      parameters,
    } = this.props;

    const {
      name: inputName,
      value: inputValue,
      type: inputType,
    } = data;

    const value = inputType === 'number' ? parseFloat(inputValue) : inputValue;

    if (inputName === 'defaultValue') {
      onChange('controlDefaultValues', [value]);
    } else {
      onChange('controlParameters', {
        ...parameters,
        [inputName]: value,
      });
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
      label,
    } = parameters;

    return (
      <Card.Content>
        <Header content="Label" subheader="The text appearing as the button label." />
        <Input
          type="text"
          placeholder="Button label"
          name="label"
          value={label}
          onChange={this.handleChange}
        />

        <Header content="Step size" subheader="The number added to the control value each time the button is clicked." />
        <Input
          type="number"
          placeholder="Step size"
          name="step"
          value={step}
          error={Number.isNaN(step)}
          onChange={this.handleChange}
        />

        <Header content="Default value" subheader="The initial value of the control." />
        <Input
          type="number"
          placeholder="Default value"
          name="defaultValue"
          value={defaultValue}
          error={Number.isNaN(defaultValue)}
          onChange={this.handleChange}
        />
      </Card.Content>
    );
  }
}

CounterControlSettings.propTypes = {
  parameters: PropTypes.shape({
    label: PropTypes.string.isRequired,
    step: PropTypes.number.isRequired,
  }).isRequired,
  defaultValues: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
  // controlType: PropTypes.oneOf(['counter']).isRequired,
};

export default CounterControlSettings;
