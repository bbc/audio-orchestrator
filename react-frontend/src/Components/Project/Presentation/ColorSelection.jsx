import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Segment,
  Input,
  Button,
} from 'semantic-ui-react';

const isValidColor = c => /#[0-9a-fA-F]{6}/.test(c);

const ColorSelection = ({
  colors,
  value,
  custom,
  name,
  onChange,
}) => {
  // Track the user-entered custom color and whether it is valid or not
  const [customColor, setCustomColor] = useState(value);
  const [customColorError, setCustomColorError] = useState(!isValidColor(value));

  // Create a click handler for selecting one of the pre-defined colors
  const handleClick = useMemo(() => (e, data) => {
    onChange(e, { name, value: data.value });
  }, [name, onChange]);

  // Create a change handler for typing into the custom color field
  const handleCustomColorChange = useMemo(() => (e, data) => {
    const fixedValue = `#${data.value.trim().replace(/#/g, '')}`.slice(0, 7);
    const isValid = isValidColor(fixedValue);

    setCustomColor(fixedValue);
    setCustomColorError(!isValid);

    if (isValid) {
      onChange(e, { name, value: fixedValue });
    }
  }, [setCustomColor, setCustomColorError, onChange]);

  return (
    <Segment>
      {colors.map(color => (
        <Button
          style={{ backgroundColor: color, color: '#ffffff' }}
          key={color}
          value={color}
          circular
          icon={color === value ? 'checkmark' : 'circle outline'}
          onClick={handleClick}
        />
      ))}
      {custom
        ? (
          <Input
            value={customColor}
            error={customColorError}
            onChange={handleCustomColorChange}
            action={{
              style: { backgroundColor: customColorError ? '#ffffff' : customColor, color: '#ffffff' },
              value: customColor,
              circular: true,
              icon: customColor === value ? 'checkmark' : 'circle outline',
              onClick: handleClick,
            }}
          />
        ) : null
      }
    </Segment>
  );
};

ColorSelection.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  value: PropTypes.string,
  custom: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

ColorSelection.defaultProps = {
  value: undefined,
  custom: false,
  name: undefined,
};

export default ColorSelection;
