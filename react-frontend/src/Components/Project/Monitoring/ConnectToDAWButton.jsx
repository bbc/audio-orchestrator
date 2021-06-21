import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { turnOSCMsgsOnOff } from 'Actions/monitoring';
import {
  useConnectedToDAW,
  useConnectedToDAWOnce,
  useCurrentSetup,
  useOSCPortNumber,
} from './helpers';
import DAWSettingsModal from './DAWSettingsModal';

const ConnectToDAWButton = ({
  objects,
  projectId,
}) => {
  const dispatch = useDispatch();
  const connectedToDAW = useConnectedToDAW();
  const connectedToDAWOnce = useConnectedToDAWOnce();
  const OSCPortNumber = useOSCPortNumber();
  const currentSetup = useCurrentSetup(projectId);
  // Set up component state to open and close the DAW settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  // There is an error here where the projectId becomes undefined when you open the Audio page.
  // Instead passed objects down as an argument instead.
  // const objects = useObjects(projectId, currentSequenceId);

  const handleClick = () => {
    if (!connectedToDAWOnce || !OSCPortNumber) {
      setSettingsOpen(true);
    } else {
      dispatch(turnOSCMsgsOnOff(!connectedToDAW, objects, currentSetup));
    }
  };

  const buttonStyle = {
    width: '226px', // Ensures the button stays the same size in both states
  };

  return (
    <>
      { settingsOpen && (
        <DAWSettingsModal
          onClose={() => setSettingsOpen(false)}
          objects={objects}
          projectId={projectId}
        />
      )}
      <Button.Group fluid basic>
        <Button
          content={connectedToDAW ? 'Disconnect from DAW' : 'Connect to DAW'}
          icon={connectedToDAW ? 'circle' : 'circle outline'}
          onClick={handleClick}
          className="icon"
          labelPosition="left"
          style={buttonStyle}
        />
        <Button
          icon="setting"
          className="icon"
          onClick={() => setSettingsOpen(true)}
        />
      </Button.Group>
    </>
  );
};

ConnectToDAWButton.propTypes = {
  objects: PropTypes.shape({}).isRequired,
  projectId: PropTypes.string.isRequired,
};

export default ConnectToDAWButton;
