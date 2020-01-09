import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';

const ListOfEnumInput = React.memo(({
  allowedValues,
  value,
  onChange,
}) => {
  const options = allowedValues.map(v => ({
    key: v.value,
    text: v.displayName,
    value: v.value,
  }));

  return (
    <Dropdown
      multiple
      selection
      value={value}
      onChange={onChange}
      options={options}
    />
  );
});

ListOfEnumInput.propTypes = {
  allowedValues: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    displayName: PropTypes.string,
  })).isRequired,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ListOfEnumInput;
