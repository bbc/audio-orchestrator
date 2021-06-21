import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { sendOSCPlayPause } from 'Actions/monitoring';
import InlineHelpPopup from 'Components/InlineHelpPopup';
import { REAPER } from 'Lib/OSC';
import { useOSCFormat, useConnectedToDAW } from './helpers';

const PlayPauseButtons = () => {
  // Set constants for required properties in state
  const OSCFormat = useOSCFormat();
  const connectedToDAW = useConnectedToDAW();
  // Create a shorthand for useDispatch
  const dispatch = useDispatch();
  // Use local state to store whether it is currently playing or not
  // (means that if the user manually plays in REAPER, we will not change the icon)
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <InlineHelpPopup
      content="Control audio playback when connected to REAPER."
      className="ui buttons"
    >
      <Button
        icon={isPlaying ? 'pause' : 'play'}
        disabled={(!connectedToDAW || OSCFormat !== REAPER)}
        onClick={() => {
          setIsPlaying(!isPlaying);
          dispatch(sendOSCPlayPause(isPlaying ? 'pause' : 'play'));
        }}
      />
    </InlineHelpPopup>
  );
};

export default PlayPauseButtons;
