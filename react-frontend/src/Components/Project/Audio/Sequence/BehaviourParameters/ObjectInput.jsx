import React from 'react';
import PropTypes from 'prop-types';
import EnumInput from './EnumInput.jsx';

const ObjectInput = React.memo(({
  objectsList,
  value,
  onChange,
  name,
}) => {
  const allowedValues = objectsList.map(({ objectNumber, label }) => ({
    // value represents objectId format generated on export
    value: `${objectNumber}-${label}`,
    displayName: `${objectNumber}: ${label}`,
  }));

  return (
    <EnumInput
      allowedValues={allowedValues}
      value={value}
      name={name}
      onChange={onChange}
    />
  );
});

ObjectInput.propTypes = {
  objectsList: PropTypes.arrayOf(PropTypes.shape({
    objectNumber: PropTypes.number,
    label: PropTypes.string,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
};

ObjectInput.defaultProps = {
  name: undefined,
};

export default ObjectInput;
