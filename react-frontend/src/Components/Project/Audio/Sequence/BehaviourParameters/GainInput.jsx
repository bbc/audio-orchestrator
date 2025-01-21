import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
} from 'semantic-ui-react';

// helper to validate that the input string is a valid number
const stringIsNumber = (value) => !Number.isNaN(parseFloat(value));

function GainInput({
  value,
  onChange,
}) {
  const [error, setError] = useState();

  const handleChange = (e, data) => {
    const { value: inputValue } = data;

    // sanitize input value by removing non-numeric characters; can't simply use parseFloat because
    // the user might be in the middle of typing a negative or decimal.
    const newValue = inputValue.replace(/[^0-9\-+.]/, '');
    const newError = !stringIsNumber(newValue);
    setError(newError);

    // validate the input value and pass it to the onChange handler only if it is valid.
    if (!newError) {
      onChange(e, {
        value: parseFloat(newValue),
      });
    }
  };

  return (
    <Input
      placeholder="Gain"
      label={{ content: 'dB', basic: true }}
      labelPosition="right"
      defaultValue={value}
      error={error}
      onChange={handleChange}
    />
  );
}

GainInput.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default GainInput;
