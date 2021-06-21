import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button, Checkbox, Input, Label,
} from 'semantic-ui-react';
import { setCurrentMonitoringSetup } from 'Actions/project';
import {
  getDefaultOrCurrentControlValues,
  replaceDeviceControlValues,
} from './helpers';

const nowrapStyle = { whiteSpace: 'nowrap' };

// Radio: replace list of value with just the one that was checked
const updateRadioValues = (values, optionId, checked) => {
  if (!checked) {
    return [];
  }

  return [optionId];
};

// Checkbox: add or remove to the list of values
const updateCheckboxValues = (values, optionId, checked) => {
  const result = values.filter(v => v !== optionId);
  if (!checked) {
    return result;
  }

  return [...result, optionId];
};

// Button: add step to the current value
const updateButtonValues = (values, step) => [`${Number(values[0]) + step}`];

const ControlsCell = ({
  control,
  device,
  controls,
  disabled,
  projectId,
  currentSetup,
}) => {
  const dispatch = useDispatch();

  const {
    controlId, controlType,
  } = control;

  const {
    controlParameters = {},
  } = controls[controlId];

  const {
    options = [],
    min, max, step, label,
  } = controlParameters;

  const values = getDefaultOrCurrentControlValues(
    controls,
    device,
    controlId,
  );

  const disabledOrOff = !device.switchedOn || disabled;

  switch (controlType) {
    // Render checkbox component if control is radio or checkbox
    case 'radio':
    case 'checkbox':
      return options.map(({ label: optionLabel, value }) => (
        <div key={value}>
          <Checkbox
            radio={controlType === 'radio'}
            key={value}
            label={optionLabel}
            name={value}
            disabled={disabledOrOff}
            checked={values.includes(value)}
            onChange={(e, { name, checked }) => dispatch(
              setCurrentMonitoringSetup(
                projectId,
                replaceDeviceControlValues(
                  controlType === 'radio' ? updateRadioValues(values, name, checked) : updateCheckboxValues(values, name, checked),
                  controlId,
                  device,
                  currentSetup,
                ),
              ),
            )}
          />
          <br />
        </div>
      ));
    // Render slider component if control is range
    case 'range':
      return (
        <div style={nowrapStyle}>
          <Input
            type="range"
            className="inputSliderFix"
            min={min}
            max={max}
            step={step}
            value={values[0]}
            disabled={disabledOrOff}
            onChange={(e, { value }) => dispatch(
              setCurrentMonitoringSetup(
                projectId,
                replaceDeviceControlValues([value], controlId, device, currentSetup),
              ),
            )}
          />
          <Label pointing="left" content={values[0]} />
        </div>
      );
    // Render button component if control is counter
    case 'counter':
      return (
        <div style={nowrapStyle}>
          <Button
            content={label}
            disabled={disabledOrOff}
            onClick={() => dispatch(
              setCurrentMonitoringSetup(
                projectId,
                replaceDeviceControlValues(
                  updateButtonValues(values, step),
                  controlId, device, currentSetup,
                ),
              ),
            )}
          />
          <Label pointing="left" content={values[0]} />
        </div>
      );
    default:
      return null;
  }
};

ControlsCell.propTypes = {
  control: PropTypes.shape({
    controlId: PropTypes.string.isRequired,
    controlType: PropTypes.string.isRequired,
  }).isRequired,
  device: PropTypes.shape({
    switchedOn: PropTypes.bool.isRequired,
  }).isRequired,
  controls: PropTypes.shape({}).isRequired,
  disabled: PropTypes.bool.isRequired,
  projectId: PropTypes.string.isRequired,
  currentSetup: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ControlsCell;
