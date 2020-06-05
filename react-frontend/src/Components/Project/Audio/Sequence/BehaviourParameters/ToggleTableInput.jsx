import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
} from 'semantic-ui-react';
import ButtonGroupToggle from 'Components/Project/Controls/ButtonGroupToggle';

const ToggleTableInput = React.memo(({
  allowedValues,
  value,
  onChange,
  name,
  labelOn,
  labelOff,
}) => {
  const handleClick = (e, {
    name: rowValue,
    value: on,
  }) => {
    // add or remove the row value from the overall value and trigger a change event.
    onChange(
      e,
      {
        name,
        value: [
          ...value.filter(v => v !== rowValue),
          ...(on ? [rowValue] : []),
        ],
      },
    );
  };

  const toggleValues = [
    { value: true, displayName: labelOn, color: 'green' },
    { value: false, displayName: labelOff, color: 'red' },
  ];

  return (
    <Table collapsing>
      <Table.Body>
        { allowedValues.map(({ displayName, value: rowValue }) => {
          const on = value.includes(rowValue);
          return (
            <Table.Row key={rowValue}>
              <Table.Cell content={displayName} collapsing />
              <Table.Cell>
                <ButtonGroupToggle
                  name={rowValue}
                  value={on}
                  allowedValues={toggleValues}
                  onChange={handleClick}
                />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
});

ToggleTableInput.propTypes = {
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
  labelOn: PropTypes.string,
  labelOff: PropTypes.string,
};

ToggleTableInput.defaultProps = {
  name: undefined,
  labelOn: 'On',
  labelOff: 'Off',
};

export default ToggleTableInput;
