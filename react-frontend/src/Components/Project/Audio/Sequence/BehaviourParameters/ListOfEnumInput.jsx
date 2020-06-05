import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';

const ListOfEnumInput = React.memo(({
  allowedValues,
  value,
  onChange,
  name,
  error,
  placeholder,
  allowAdditions,
  onAddItem,
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
      name={name}
      fluid
      error={error}
      placeholder={placeholder}
      search={allowAdditions}
      allowAdditions={allowAdditions}
      onAddItem={onAddItem}
    />
  );
});

ListOfEnumInput.propTypes = {
  allowedValues: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool,
      PropTypes.number,
    ]),
    displayName: PropTypes.string,
  })).isRequired,
  value: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
  ])).isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
  allowAdditions: PropTypes.bool,
  onAddItem: PropTypes.func,
};

ListOfEnumInput.defaultProps = {
  name: undefined,
  error: false,
  placeholder: undefined,
  allowAdditions: false,
  onAddItem: undefined,
};

export default ListOfEnumInput;
