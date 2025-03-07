import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
} from 'semantic-ui-react';

const ButtonGroupToggle = React.memo(({
  allowedValues,
  value,
  onChange,
  name,
}) => (
  <Button.Group size="tiny" fluid>
    { allowedValues.map(({ value: optionValue, displayName, color }) => (
      <Button
        name={name}
        key={optionValue}
        positive={optionValue === value && !color}
        color={optionValue === value && color ? color : undefined}
        icon={optionValue === value ? 'dot circle outline' : 'circle outline'}
        content={displayName}
        onClick={(e) => onChange(e, { name, value: optionValue })}
      />
    ))}
  </Button.Group>
));

ButtonGroupToggle.propTypes = {
  allowedValues: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    displayName: PropTypes.string,
  })).isRequired,
  value: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
  ]).isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
};

ButtonGroupToggle.defaultProps = {
  name: undefined,
};

export default ButtonGroupToggle;
