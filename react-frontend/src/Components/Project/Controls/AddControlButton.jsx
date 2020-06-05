// TODO mostly copied from AddBehaviourButton, perhaps refactor to use a common component for both
import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';
import controlTypes from './controlTypes';

const AddControlButton = React.memo(({
  onAddControl,
}) => {
  const options = controlTypes.map(({
    name: controlType,
    displayName,
    icon,
    parameters = [],
  }) => ({
    key: controlType,
    value: controlType,
    text: displayName || controlType,
    icon: icon || null,
    onClick: () => {
      const controlParameters = {};
      parameters.forEach(({ name: parameterName, defaultValue }) => {
        controlParameters[parameterName] = defaultValue;
      });

      onAddControl(
        controlType,
        `New ${(displayName || controlType).toLowerCase()} control`,
        controlParameters,
        ['counter', 'range'].includes(controlType) ? [0] : [],
      );
    },
  }));

  return (
    <Dropdown
      text="Add control"
      className="icon primary"
      value=""
      options={options}
      floating
      button
      labeled
      icon="plus"
    />
  );
});

AddControlButton.propTypes = {
  onAddControl: PropTypes.func.isRequired,
};

export default AddControlButton;
