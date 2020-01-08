import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
} from 'semantic-ui-react';

// Convert between linear gain unit (stored in metadata) and dB (displayed to user) as per WebAudio
// spec: https://webaudio.github.io/web-audio-api/#linear-to-decibel
const linearGainToDecibels = v => (v === 0 ? -1000 : 20 * Math.log10(v));
const decibelsToLinearGain = v => 10 ** (v / 20);

// helper to validate that the input string is a valid number
const stringIsNumber = value => !Number.isNaN(parseFloat(value));

class GainInput extends React.PureComponent {
  constructor(props) {
    super(props);

    const { value } = props;

    this.state = {
      error: false,
      displayValue: linearGainToDecibels(value).toFixed(1),
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, data) {
    const { onChange } = this.props;
    const { value: inputValue } = data;

    // sanitize input value by removing non-numeric characters; can't simply use parseFloat because
    // the user might be in the middle of typing a negative or decimal.
    const displayValue = inputValue.replace(/[^0-9\-+.]/, '');
    const error = !stringIsNumber(displayValue);
    this.setState({
      displayValue,
      error,
    });

    // validate the display value and pass it to the onChange handler only if it is valid.
    // if it is not valid, save the default value of unity gain instead.
    const value = error ? 1.0 : decibelsToLinearGain(parseFloat(displayValue));
    onChange(e, { value });
  }

  render() {
    const {
      error,
      displayValue,
    } = this.state;

    return (
      <Input
        placeholder="Gain"
        label={{ content: 'dB', basic: true }}
        labelPosition="right"
        error={error}
        value={displayValue}
        onChange={this.handleChange}
      />
    );
  }
}

GainInput.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default GainInput;
