import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  Header,
  Input,
  Divider,
  Checkbox,
  Label,
} from 'semantic-ui-react';
import { setOSCFormat, setOSCPortNumber, turnOSCMsgsOnOff } from '#Actions/monitoring.js';
import {
  REAPER,
  MIEM_MATRIX_L_R,
} from '#Lib/OSC.js';
import {
  useOSCFormat,
  useOSCPortNumber,
  useCurrentSetup,
  useConnectedToDAW,
} from './helpers.js';

function DAWSettingsModal({
  onClose,
  objects,
  projectId,
}) {
  const dispatch = useDispatch();
  const currentSetup = useCurrentSetup(projectId);
  const OSCFormat = useOSCFormat();
  const OSCPortNumber = useOSCPortNumber();
  const connectedToDAW = useConnectedToDAW();
  const [portNumber, setPortNumber] = useState(OSCPortNumber);
  const valid = portNumber > 0 && portNumber < 65536;
  const [format, setFormat] = useState(OSCFormat);

  const validFormats = [REAPER, MIEM_MATRIX_L_R];

  const handleFormatChange = (e, { name, checked }) => {
    // only update local state until user clicks connect button
    if (checked && validFormats.includes(name)) {
      setFormat(name);
    }
  };

  const handlePortNumberChange = (e, { value }) => {
    // only update local state until user clicks connect button
    setPortNumber(value);
  };

  const handleConnect = () => {
    dispatch(setOSCFormat(format));
    dispatch(setOSCPortNumber(portNumber));
    dispatch(turnOSCMsgsOnOff(true, objects, currentSetup));
    onClose();
  };

  return (
    <Modal
      open
      closeIcon
      onClose={onClose}
    >
      <Modal.Header>
        Connection settings
      </Modal.Header>
      <Modal.Content>
        <Header
          content="Interaction with DAW"
          subheader="Select the type of DAW connection you are using."
        />
        <Checkbox
          radio
          label="Direct control of REAPER DAW"
          checked={format === REAPER}
          name={REAPER}
          onChange={handleFormatChange}
        />
        <br />
        <Checkbox
          radio
          label="Use MIEM Matrix Router VST plug-in"
          name={MIEM_MATRIX_L_R}
          checked={format === MIEM_MATRIX_L_R}
          onChange={handleFormatChange}
        />
        <Divider />
        <Header
          content="OSC port"
          subheader="Set the port number your DAW is listening on."
        />
        <Input
          type="number"
          label="Port number"
          defaultValue={portNumber}
          onChange={handlePortNumberChange}
        />
        {!valid && (
          <Label
            basic
            color="red"
            icon="exclamation"
            content="Port number must be between 1 and 65535."
          />
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Close"
          onClick={onClose}
        />
        <Button
          content={connectedToDAW ? 'Reconnect' : 'Connect'}
          primary
          onClick={handleConnect}
          disabled={!valid}
        />
      </Modal.Actions>
    </Modal>
  );
}

DAWSettingsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.string.isRequired,
  objects: PropTypes.shape({}).isRequired,
};

export default DAWSettingsModal;
