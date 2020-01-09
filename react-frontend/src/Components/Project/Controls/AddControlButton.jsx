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
    name,
    displayName,
    icon,
  }) => ({
    key: name,
    value: name,
    text: displayName || name,
    icon: icon || null,
    onClick: () => {
      onAddControl(name, `New ${displayName || name} control`);
    },
  }));

  return (
    <Dropdown
      floating
      button
      text="Add control"
      className="small compact primary"
      value=""
      options={options}
    />
  );
});

AddControlButton.propTypes = {
  onAddControl: PropTypes.func.isRequired,
};

export default AddControlButton;
