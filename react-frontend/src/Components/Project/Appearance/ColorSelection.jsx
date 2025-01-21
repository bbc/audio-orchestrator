import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Button,
} from 'semantic-ui-react';
import { useDebounce } from '#Components/utils.js';

const isValidColor = (c) => /#[0-9a-fA-F]{6}/.test(c);

const colorInputStyles = {
  display: 'inline-block',
  verticalAlign: 'bottom',
  height: '38px',
  border: '1px solid rgba(34, 36, 38, 0.15)',
  background: '#fff',
  margin: '0 4px',
  borderRadius: '4px',
};

function ColorSelection({
  colors,
  value,
  custom,
  name,
  onChange,
  disabled,
}) {
  // Track the user-entered custom color and whether it is valid or not
  const [customColor, setCustomColor] = useState(value);
  const [customColorError, setCustomColorError] = useState(!isValidColor(value));

  // Create a click handler for selecting one of the pre-defined colors
  const handleClick = useMemo(() => (e, data) => {
    onChange(e, { name, value: data.value });
    setCustomColor(data.value);
    setCustomColorError(false);
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
  }, [name, setCustomColor, setCustomColorError, onChange]);

  const handleCustomColorChangeDebounced = useDebounce(handleCustomColorChange);

  return (
    <>
      {custom
        ? (
          <>
            <input
              type="color"
              value={customColorError ? '#ffffff' : customColor}
              style={colorInputStyles}
              disabled={disabled}
              onChange={(e) => handleCustomColorChangeDebounced(e, { value: e.target.value })}
            />
            <Input
              value={customColor}
              error={customColorError}
              onChange={handleCustomColorChange}
              disabled={disabled}
            >
              <input type="text" style={{ width: 'auto', marginRight: '4px' }} disabled={disabled} />
            </Input>
          </>
        ) : null}
      {colors.map((color) => (
        <Button
          style={{ backgroundColor: color, color: '#ffffff' }}
          key={color}
          value={color}
          circular
          icon={color === value ? 'checkmark' : 'circle outline'}
          onClick={handleClick}
          disabled={disabled}
        />
      ))}
    </>
  );
}

ColorSelection.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.string,
  custom: PropTypes.bool,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ColorSelection.defaultProps = {
  value: undefined,
  custom: false,
  name: undefined,
  colors: [],
  disabled: false,
};

export default ColorSelection;
