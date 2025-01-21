import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';
import Behaviours from '#Lib/Behaviours.js';

// TODO: Using the click handler instead of onChange does not allow adding a behaviour using the
// keyboard, but fixes a bug where behaviours were added when the dropdown lost focus.
const AddBehaviourButton = React.memo(({
  onAddBehaviour,
  usedBehaviourTypes,
  text,
  disabled,
  controls,
}) => {
  const options = Behaviours.getAllDetails({ includeFixed: false }, controls)
    .map(({
      behaviourType,
      displayName,
      multiple,
      color,
    }) => {
      const cannotAdd = !multiple && usedBehaviourTypes.includes(behaviourType);
      const isUserControl = behaviourType.startsWith('control:');

      return {
        key: behaviourType,
        value: behaviourType,
        text: isUserControl ? `User control: ${displayName}` : (displayName || behaviourType),
        disabled: cannotAdd,
        icon: cannotAdd ? {
          name: 'checkmark',
          color,
        } : {
          name: 'circle',
          color,
        },
        onClick: cannotAdd ? null : () => {
          onAddBehaviour(behaviourType, Behaviours.getDefaultParameters(behaviourType, controls));
        },
      };
    });

  return (
    <Dropdown
      text={text}
      disabled={disabled}
      options={options}
      value=""
      className="icon tiny compact primary"
      floating
      button
      labeled
      icon="plus"
    />
  );
});

AddBehaviourButton.propTypes = {
  onAddBehaviour: PropTypes.func.isRequired,
  usedBehaviourTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  text: PropTypes.string,
  disabled: PropTypes.bool,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
};

AddBehaviourButton.defaultProps = {
  text: 'Add behaviour',
  disabled: false,
  controls: [],
};

export default AddBehaviourButton;
