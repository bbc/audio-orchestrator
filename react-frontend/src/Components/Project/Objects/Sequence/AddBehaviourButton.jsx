import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';
import behaviourTypes from './behaviourTypes';

const behaviourOptions = behaviourTypes.map(({ name, displayName, multiple }) => ({
  key: name,
  value: name,
  text: displayName,
  multiple,
}));

const AddBehaviourButton = ({
  onAddBehaviour,
  usedBehaviourTypes,
}) => {
  const options = behaviourOptions.map((option) => {
    const { multiple } = option;
    const disabled = !multiple && usedBehaviourTypes.includes(option.value);

    return {
      ...option,
      disabled,
      icon: disabled ? 'checkmark' : 'plus',
    };
  });

  // TODO: Using the subcomponent API for the Dropdown breaks keyboard navigation, but it is needed
  // to avoid activating an item when the menu is closed or the up/down keys are moved (as with
  // previous onChange handler)
  return (
    <Dropdown
      floating
      button
      text="Add behaviour"
      className="small compact primary"
      value=""
    >
      <Dropdown.Menu>
        {options.map(option => (
          <Dropdown.Item
            {...option}
            onClick={() => onAddBehaviour(option.value)}
          />
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

AddBehaviourButton.propTypes = {
  onAddBehaviour: PropTypes.func.isRequired,
  usedBehaviourTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AddBehaviourButton;
