import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { sendOSCPlayPause, setDAWIsPlaying } from '#Actions/monitoring.js';
import InlineHelpPopup from '#Components/InlineHelpPopup.jsx';
import { REAPER } from '#Lib/OSC.js';
import { useOSCFormat, useConnectedToDAW } from './helpers.js';

function PlayPauseButtons() {
  // Set constants for required properties in state
  const OSCFormat = useOSCFormat();
  const connectedToDAW = useConnectedToDAW();
  // Create a shorthand for useDispatch
  const dispatch = useDispatch();
  const isPlaying = useSelector((state) => state.Monitoring.isPlaying);
  const setIsPlaying = (newIsPlaying) => dispatch(setDAWIsPlaying(newIsPlaying));
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
}

export default PlayPauseButtons;
