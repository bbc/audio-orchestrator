import React from 'react';
import PropTypes from 'prop-types';
import ToggleTableInput from './ToggleTableInput';
import RangeInput from './RangeInput';

const ControlValuesInput = React.memo(({
  value,
  onChange,
  name,
  error,
  placeholder,
  controlId,
  controls,
}) => {
  const control = controls.find(c => c.controlId === controlId) || {};
  const {
    controlType,
    controlName,
    controlParameters = {},
  } = control;

  if (controlType === 'checkbox' || controlType === 'radio') {
    const allowedValues = (controlParameters.options || []).map(option => ({
      value: option.value,
      displayName: option.label,
    }));

    if (allowedValues.length === 0) {
      return (
        <p>
          {`The control "${controlName}" currently has no options. Add the desired options on the Controls page and they will appear here.`}
        </p>
      );
    }

    return (
      <ToggleTableInput
        allowedValues={allowedValues}
        labelOn="allowed"
        labelOff="prohibited"
        value={value || []}
        onChange={onChange}
        name={name}
        error={error}
      />
    );
  }

  if (controlType === 'counter' || controlType === 'range') {
    return (
      <RangeInput
        value={value}
        onChange={onChange}
        name={name}
        error={error}
        placeholder={placeholder}
      />
    );
  }

  return <p>{`The control type ${controlType} is not supported.`}</p>;
});

ControlValuesInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool,
    PropTypes.number,
  ])).isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  controlId: PropTypes.string.isRequired,
};

ControlValuesInput.defaultProps = {
  name: undefined,
  error: false,
  placeholder: undefined,
};

export default ControlValuesInput;
