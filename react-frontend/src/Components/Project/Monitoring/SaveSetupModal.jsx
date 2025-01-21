import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  Input,
  Icon,
} from 'semantic-ui-react';
import {
  addSavedMonitoringSetup,
} from '#Actions/project.js';
import { deviceTypes } from '#Lib/behaviourTypes.js';

const MAX_DEVICES_SHOWN = 25;
const MAX_DEVICES_NAMED = 8;

const formatSetupName = (setup) => {
  const deviceNames = setup.slice(0, MAX_DEVICES_NAMED)
    .map(({ displayName }) => `${displayName}`);

  return [
    setup.length,
    ': ',
    deviceNames.join(', '),
    setup.length > MAX_DEVICES_NAMED ? '...' : '',
  ].join('');
};

function SaveSetupModal({
  onClose,
  setup,
  projectId,
}) {
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
      <Modal.Header
        content="Save current device setup"
      />
      <Modal.Content>
        <p>
          {setup.slice(0, MAX_DEVICES_SHOWN).map(({ deviceId, deviceType }) => (
            <Icon
              key={deviceId}
              name={(deviceTypes.find(({ value }) => value === deviceType) || {}).icon}
              size="large"
            />
          ))}
          {setup.length > MAX_DEVICES_SHOWN && <span>&hellip;</span>}
        </p>
        <Input
          type="text"
          placeholder="Device setup name"
          label="Name"
          defaultValue={deviceSetupName}
          onChange={handleNameChange}
          fluid
        />
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Cancel"
          onClick={onClose}
        />
        <Button
          content="Save"
          primary
          onClick={() => {
            dispatch(addSavedMonitoringSetup(projectId, setup, deviceSetupName));
            onClose();
          }}
        />
      </Modal.Actions>
    </Modal>
  );
}

SaveSetupModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  setup: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
  })).isRequired,
  projectId: PropTypes.string.isRequired,
};

export default SaveSetupModal;
