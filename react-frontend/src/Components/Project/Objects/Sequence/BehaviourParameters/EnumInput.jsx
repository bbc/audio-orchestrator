import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';

const EnumInput = React.memo(({
  allowedValues,
  value,
  onChange,
  name,
}) => {
  const options = allowedValues.map(v => ({
    key: v.value,
    text: v.displayName,
    value: v.value,
  }));

  return (
    <Dropdown
      selection
      value={value}
      onChange={onChange}
      options={options}
      name={name}
    />
  );
});

EnumInput.propTypes = {
  allowedValues: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    displayName: PropTypes.string,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
};

EnumInput.defaultProps = {
  name: undefined,
};

export default EnumInput;
