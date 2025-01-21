import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
} from 'semantic-ui-react';
import ButtonGroupToggle from './ButtonGroupToggle.jsx';
import {
  makeBehavioursWithAllowedDevices,
  getDevicesAllowed,
  devicesOptions,
} from './controlBehaviourHelpers.js';

class ControlBehavioursDevices extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, data) {
    const { value } = data;
    const {
      controlBehaviours,
      onChange,
    } = this.props;

    onChange('controlBehaviours', makeBehavioursWithAllowedDevices(controlBehaviours, value));
  }

  render() {
    const {
      controlBehaviours,
    } = this.props;

    return (
      <Card.Content extra>
        <ButtonGroupToggle
          value={getDevicesAllowed(controlBehaviours)}
          allowedValues={devicesOptions}
          onChange={this.handleChange}
        />
        Select which devices the control should be visible on.
      </Card.Content>
    );
  }
}

ControlBehavioursDevices.propTypes = {
  controlBehaviours: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ControlBehavioursDevices;
