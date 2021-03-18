import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';

const numeralSuffixes = ['th', 'st', 'nd', 'rd'];
const modulusOptions = new Array(50).fill(0).map((d, i) => ({
  key: i + 1,
  value: i + 1,
  text: (
    <span>
      {i + 1}
      <sup>{numeralSuffixes[i + 1] || 'th'}</sup>
    </span>
  ),
}));

const offsetOptions = new Array(50).fill(0).map((d, i) => ({
  key: i + 1,
  value: i + 1,
  text: `${i + 1}`,
}));

const ModulusInput = React.memo(({
  value,
  onChange,
  name,
}) => {
  const [modulus, setModulus] = useState();
  const [offset, setOffset] = useState();

  // when component state changes, call the onChange handler
  useEffect(() => {
    // Don't propagate the initial undefined values
    if (modulus === undefined || offset === undefined) {
      return;
    }

    onChange({}, {
      name,
      value: [modulus, offset],
    });
  }, [modulus, offset, name, onChange]);

  // When the value prop changes, reflect changes in component state
  useEffect(() => {
    // ConditionInput sets value to '' if it's actually undefined to avoid changing to uncontrolled
    // input component so we have to handle both here.
    if (value !== undefined && value !== '') {
      // Set default values if value given is undefined
      if (Array.isArray(value)) {
        setModulus(value[0]);
        setOffset(value[1]);
      } else {
        setModulus(value);
        setOffset(1);
      }
    } else {
      // Set default values if value given is undefined
      setModulus(1);
      setOffset(1);
    }
  }, [value, setModulus, setOffset]);

  // Handler for the dropdown change events; update component state
  const handleChange = (e, data) => {
    const changedValue = parseInt(data.value, 10);

    switch (data.name) {
      case 'modulus':
        setModulus(changedValue);
        break;
      case 'offset':
        setOffset(changedValue);
        break;
      default:
        break;
    }
  };

  return (
    <span>
      Every
      {' '}
      <Dropdown button inline scrolling options={modulusOptions} value={modulus} name="modulus" onChange={handleChange} />
      , starting at
      {' '}
      <Dropdown button inline scrolling options={offsetOptions} value={offset || modulus} name="offset" onChange={handleChange} />
      {modulus !== undefined && (
        <span>
          {` (${[0, 1, 2, 3].map(d => modulus * d + (offset || 0)).join(', ')}, `}
          &hellip;)
        </span>
      )}
    </span>
  );
});

ModulusInput.propTypes = {
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.number,
    PropTypes.string, // because ConditionInput translates undefined to ''
  ]),
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
};

ModulusInput.defaultProps = {
  value: undefined,
  name: undefined,
};

export default ModulusInput;
