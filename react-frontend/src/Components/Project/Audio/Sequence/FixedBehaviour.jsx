import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  Popup,
} from 'semantic-ui-react';
import Behaviours from 'Lib/Behaviours';

const getParameterOptions = parameter => parameter.allowedValues.map(({
  value,
  displayName,
}) => ({
  key: value,
  value,
  text: displayName,
}));

const FixedBehaviour = ({
  behaviourType,
  behaviourParameters,
  onChange,
}) => {
  const {
    description,
    parameters,
    color,
  } = Behaviours.getDetails(behaviourType);

  const parameter = parameters[0]; // TODO assuming there is only one parameter
  const value = behaviourParameters[parameter.name];
  const valueText = (parameter.allowedValues.find(av => av.value === value) || {}).displayName;

  const handleChange = (e, data) => {
    onChange({
      [parameter.name]: data.value,
    });
  };

  return (
    <Popup
      inverted
      basic
      content={description}
      trigger={(
        <Dropdown
          floating
          button
          text={valueText}
          className={`tiny compact ${color}`}
          value={value}
          options={getParameterOptions(parameter)}
          onChange={handleChange}
        />
      )}
    />
  );
};

FixedBehaviour.propTypes = {
  behaviourType: PropTypes.string.isRequired,
  behaviourParameters: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default FixedBehaviour;
