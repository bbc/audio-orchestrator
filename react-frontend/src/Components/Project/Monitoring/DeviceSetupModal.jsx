import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  Header,
  Input,
  Icon,
  Grid,
  Divider,
} from 'semantic-ui-react';
import {
  addSavedMonitoringSetup,
} from 'Actions/project';
import { deviceTypes } from 'Lib/behaviourTypes';
import DeleteDeviceSetupModalSection from './DeleteDeviceSetupModalSection';

const formatSetupName = (setup) => {
  const maxDeviceNames = 8;
  const deviceNames = setup.slice(0, maxDeviceNames)
    .map(({ displayName }) => `${displayName}`);

  return [
    setup.length,
    ': ',
    deviceNames.join(', '),
    setup.length > maxDeviceNames ? '...' : '',
  ].join('');
};

const DeviceSetupModal = ({
  onClose,
  setup,
  projectId,
}) => {
  // state and handlers for naming a device setup
  const [deviceSetupName, setDeviceSetupName] = useState(formatSetupName(setup));
  const handleNameChange = (e, data) => {
    const {
      value: inputValue,
    } = data;
    setDeviceSetupName(inputValue);
  };
  const dispatch = useDispatch();
  return (
    <Modal
      open
      closeIcon
      onClose={onClose}
    >
      <Modal.Header>
        Manage device setups
      </Modal.Header>
      <Modal.Content>
        <Header
          content="Save current device setup"
          subheader="Save this arrangement of devices, including the controls."
        />
        <div>
          {setup.map(({ deviceId, deviceType }) => (
            <Icon
              key={deviceId}
              name={(deviceTypes.find(({ value }) => value === deviceType) || {}).icon}
              size="large"
            />
          ))}
        </div>
        <br />
        <Grid columns="2">
          <Grid.Row>
            <Grid.Column width="14">
              <Input
                type="text"
                placeholder="Device setup name"
                label="Name"
                defaultValue={deviceSetupName}
                onChange={handleNameChange}
                fluid
              />
            </Grid.Column>
            <Grid.Column width="1">
              <Button
                content="Save"
                primary
                onClick={() => dispatch(
                  addSavedMonitoringSetup(
                    projectId,
                    setup,
                    deviceSetupName,
                  ),
                )}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <Divider />
        <DeleteDeviceSetupModalSection projectId={projectId} />
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Close"
          onClick={onClose}
        />
      </Modal.Actions>
    </Modal>
  );
};


DeviceSetupModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  setup: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
  })).isRequired,
  projectId: PropTypes.string.isRequired,
};

export default DeviceSetupModal;
