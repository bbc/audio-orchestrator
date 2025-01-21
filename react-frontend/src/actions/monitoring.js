/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*//* eslint-disable import/prefer-default-export */
import { defaultOSCSettings } from '#Lib/OSC.js';

import getExportObjectBehaviours from '#Lib/getExportObjectBehaviours.js';
import { getDefaultOrCurrentControlValues, getDeviceCurrentNumber } from '#Components/Project/Monitoring/helpers.js';

export const muteSoloDevice = (deviceId, muteDevices, soloDevices, objects, currentSetup) => ({
  type: 'MUTE_SOLO_DEVICE',
  deviceId,
  muteDevices,
  soloDevices,
  objects,
  currentSetup,
});

// Actions to control OSC settings
// requests the settings from the config and dispatches another action to update the store.
export const requestGetOSCSettings = () => (dispatch) => {
  window.monitoringFunctions.getOSCSettings().then((storedSettings) => {
    const settings = storedSettings || defaultOSCSettings;
    dispatch({
      type: 'SET_OSC_SETTINGS',
      settings,
    });
  });
};

export const setOSCFormat = (format) => ({
  type: 'SET_OSC_FORMAT',
  format,
});

export const setOSCPortNumber = (portNumber) => ({
  type: 'SET_OSC_PORT_NUMBER',
  portNumber,
});

export const sendOSCPlayPause = (action) => ({
  type: 'SEND_OSC_PLAY_PAUSE',
  action,
});

// Actions to control the algorithm
export const resetAlgorithmResults = () => ({
  type: 'RESET_PREVIOUS_ALGORITHM_RESULTS',
});

export const runAlgorithm = (
  exportedObjects,
  exportedDevices,
  session,
  originalObjects,
  currentSetup,
) => ({
  type: 'RUN_ALLOCATION_ALGORITHM',
  exportedObjects,
  exportedDevices,
  session,
  originalObjects,
  currentSetup,
});

export const runAlgorithmWithExportedMetadata = (
  objectsList,
  objects,
  controls,
  devices,
  currentSequenceId,
) => {
  // Put object metadata in right format for algorithm
  const exportedObjects = objectsList.map(({ objectNumber }) => {
    const object = objects[objectNumber];
    const exportBehaviours = getExportObjectBehaviours(object.objectBehaviours, controls);
    return {
      objectId: `${object.objectNumber}-${object.label}`,
      objectBehaviours: exportBehaviours,
    };
  });
  // Put device metadata in right format for algorithm
  const exportedDevices = devices
    .filter(
      ({ switchedOn }) => switchedOn === true,
    )
    .map((device) => {
      // Put control values in the right format
      const exportedDeviceControls = Object.keys(controls).map((controlId) => {
        const controlValues = getDefaultOrCurrentControlValues(controls, device, controlId);
        return {
          controlId,
          controlValues,
        };
      });
      return {
        deviceId: device.deviceId,
        deviceIsMain: device.joiningNumber === 1,
        deviceJoiningNumber: device.joiningNumber,
        deviceCurrentNumber: getDeviceCurrentNumber(device, devices),
        deviceType: device.deviceType,
        deviceControls: exportedDeviceControls,
      };
    });
  // Create session metadata
  const session = {
    currentContentId: currentSequenceId,
    numDevices: exportedDevices.length,
  };
  return runAlgorithm(exportedObjects, exportedDevices, session, objects, devices);
};

export const turnOSCMsgsOnOff = (switchedOnStatus, objects, currentSetup) => ({
  type: 'TURN_OSC_MESSAGES_ON_OFF',
  connectedToDAW: switchedOnStatus,
  objects,
  currentSetup,
});

export const setDAWIsPlaying = (isPlaying) => ({
  type: 'SET_DAW_IS_PLAYING',
  isPlaying,
});
