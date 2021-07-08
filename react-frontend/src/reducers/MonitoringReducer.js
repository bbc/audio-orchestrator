import DefaultAllocationAlgorithm from '@bbc/bbcat-orchestration/src/allocation-algorithm/DefaultAllocationAlgorithm';
import {
  sendOSCMsgs,
  sendOSCMsgsTurnAllTracksOn,
  sendOSCPlayPause,
  setOSCSettings,
} from 'Lib/OSC';

const allocationAlgorithm = new DefaultAllocationAlgorithm({ saveSteps: false });

const initialState = {
  connectedToDAW: false,
  connectedToDAWOnce: false,
  isPlaying: false,
  OSCSettings: {},
  muteDevices: [],
  soloDevices: [],
  previousResults: {
    allocations: {},
    runNumber: null,
    objectIdsEverAllocated: [],
  },
};

let algorithmOutput = null;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'MUTE_SOLO_DEVICE':
      if (state.connectedToDAW === true) {
        sendOSCMsgs(
          algorithmOutput,
          state.OSCSettings.portNumber,
          action.objects,
          action.currentSetup,
          state.OSCSettings.format,
          action.muteDevices,
          action.soloDevices,
        );
      }
      return {
        ...state,
        muteDevices: action.muteDevices,
        soloDevices: action.soloDevices,
      };
    case 'SET_OSC_SETTINGS':
      // This action does _not_ update the config, it only updates the state as it is used when
      // the initial config is retrieved.
      return {
        ...state,
        OSCSettings: action.settings,
      };
    case 'SET_OSC_FORMAT':
      // This action _does_ update the config and the store.
      setOSCSettings({
        ...state.OSCSettings,
        format: action.format,
      });

      return {
        ...state,
        OSCSettings: {
          ...state.OSCSettings,
          format: action.format,
        },
      };
    case 'SET_OSC_PORT_NUMBER':
      // This action _does_ update the config and the store.
      setOSCSettings({
        ...state.OSCSettings,
        portNumber: action.portNumber,
      });

      return {
        ...state,
        OSCSettings: {
          ...state.OSCSettings,
          portNumber: action.portNumber,
        },
      };
    case 'RESET_PREVIOUS_ALGORITHM_RESULTS':
      return {
        ...state,
        previousResults: {
          allocations: {},
          runNumber: null,
          objectIdsEverAllocated: [],
        },
      };
    case 'RUN_ALLOCATION_ALGORITHM':
      algorithmOutput = allocationAlgorithm.allocate({
        objects: action.exportedObjects,
        devices: action.exportedDevices,
        session: action.session,
        previousResults: state.previousResults,
      });
      if (state.connectedToDAW === true) {
        sendOSCMsgs(
          algorithmOutput,
          state.OSCSettings.portNumber,
          action.originalObjects,
          action.currentSetup,
          state.OSCSettings.format,
          state.muteDevices,
          state.soloDevices,
        );
      }
      return {
        ...state,
        previousResults: algorithmOutput,
      };
    case 'TURN_OSC_MESSAGES_ON_OFF':
      if (action.connectedToDAW === true) {
        sendOSCMsgs(
          algorithmOutput,
          state.OSCSettings.portNumber,
          action.objects,
          action.currentSetup,
          state.OSCSettings.format,
          state.muteDevices,
          state.soloDevices,
        );
      } else if (action.connectedToDAW === false) {
        sendOSCMsgsTurnAllTracksOn(
          state.OSCSettings.portNumber,
          state.OSCSettings.format,
        );
      }
      return {
        ...state,
        connectedToDAW: action.connectedToDAW,
        connectedToDAWOnce: state.connectedToDAWOnce || action.connectedToDAW,
      };
    case 'SEND_OSC_PLAY_PAUSE':
      sendOSCPlayPause(
        state.OSCSettings.portNumber,
        action.action,
      );
      return {
        ...state,
      };
    case 'SET_DAW_IS_PLAYING':
      return {
        ...state,
        isPlaying: action.isPlaying,
      };
    default:
      return state;
  }
};

export default reducer;
