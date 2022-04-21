import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
} from 'semantic-ui-react';

// helper to validate that the input string is a valid number
const stringIsNumber = value => !Number.isNaN(parseFloat(value));

const RangeInput = ({
  value,
  onChange,
}) => {
  const handleChange = (e, data) => {
    const { value: inputValue, name } = data;

    // sanitize input value by removing non-numeric characters; can't simply use parseFloat because
    // the user might be in the middle of typing a negative or decimal.
    const newValue = inputValue.replace(/[^0-9\-+.]/, '');
    const newError = !stringIsNumber(newValue);

    // validate the input value and pass it to the onChange handler only if it is valid.
    if (!newError) {
      onChange(e, {
        value: [
          name === 'min' ? parseFloat(newValue) : value[0],
          name === 'max' ? parseFloat(newValue) : value[1],
        ],
      });
    }
  };

  return (
    <div>
      <Input
        placeholder="Min"
        name="min"
        defaultValue={value[0]}
        onChange={handleChange}
      />
      {' '}
      &mdash;
      {' '}
      <Input
        placeholder="Max"
        defaultValue={value[1]}
        name="max"
        onChange={handleChange}
      />
    </div>
  );
};

RangeInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RangeInput;
