import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';
import { behaviourTypes, behaviourTypeDetails } from './behaviourTypes';

// TODO: Using the click handler instead of onChange does not allow adding a behaviour using the
// keyboard, but fixes a bug where behaviours were added when the dropdown lost focus.
const AddBehaviourButton = React.memo(({
  onAddBehaviour,
  usedBehaviourTypes,
  text,
  disabled,
}) => {
  const options = behaviourTypes.map((behaviourType) => {
    const {
      displayName,
      multiple,
      parameters,
    } = behaviourTypeDetails[behaviourType];

    const cannotAdd = !multiple && usedBehaviourTypes.includes(behaviourType);

    return {
      key: behaviourType,
      value: behaviourType,
      text: displayName || behaviourType,
      disabled: cannotAdd,
      icon: cannotAdd ? 'checkmark' : 'plus',
      onClick: cannotAdd ? null : () => {
        const defaultParameters = {};
        (parameters || []).forEach(({ name: parameterName, defaultValue }) => {
          defaultParameters[parameterName] = defaultValue;
        });
        onAddBehaviour(behaviourType, defaultParameters);
      },
    };
  });

  return (
    <Dropdown
      floating
      disabled={disabled}
      button
      text={text}
      className="tiny compact primary"
      value=""
      options={options}
    />
  );
});

AddBehaviourButton.propTypes = {
  onAddBehaviour: PropTypes.func.isRequired,
  usedBehaviourTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  text: PropTypes.string,
  disabled: PropTypes.bool,
};

AddBehaviourButton.defaultProps = {
  text: 'Add behaviour',
  disabled: false,
};

export default AddBehaviourButton;
