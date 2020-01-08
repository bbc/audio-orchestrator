import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';
import behaviourTypes from './behaviourTypes';


// TODO: Using the click handler instead of onChange does not allow adding a behaviour using the
// keyboard, but fixes a bug where behaviours were added when the dropdown lost focus.
const AddBehaviourButton = React.memo(({
  onAddBehaviour,
  usedBehaviourTypes,
}) => {
  const options = behaviourTypes.map(({
    name,
    displayName,
    multiple,
    parameters,
  }) => {
    const disabled = !multiple && usedBehaviourTypes.includes(name);

    return {
      key: name,
      value: name,
      text: displayName || name,
      disabled,
      icon: disabled ? 'checkmark' : 'plus',
      onClick: disabled ? null : () => {
        const defaultParameters = {};
        (parameters || []).forEach(({ name: parameterName, defaultValue }) => {
          defaultParameters[parameterName] = defaultValue;
        });
        onAddBehaviour(name, defaultParameters);
      },
    };
  });

  return (
    <Dropdown
      floating
      button
      text="Add behaviour"
      className="small compact primary"
      value=""
      options={options}
    />
  );
});

AddBehaviourButton.propTypes = {
  onAddBehaviour: PropTypes.func.isRequired,
  usedBehaviourTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default AddBehaviourButton;
