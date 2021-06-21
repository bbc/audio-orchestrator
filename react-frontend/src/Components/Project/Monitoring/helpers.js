import { useSelector } from 'react-redux';
import uuidv4 from 'uuid';

/**
 * Functions to take things from Redux state
 */
export const useControls = (projectId) => {
  const controls = useSelector(state => state.Project.projects[projectId].controls);
  return controls;
};

export const useControlsList = (projectId) => {
  const controlsList = useSelector(state => state.Project.projects[projectId].controlsList);
  return controlsList;
};

export const useSequencesList = (projectId) => {
  const sequencesList = useSelector(state => state.Project.projects[projectId].sequencesList);
  return sequencesList;
};

export const useObjectsList = (projectId, currentSequenceId) => {
  const objectsList = useSelector(
    state => state.Project.projects[projectId].sequences[currentSequenceId].objectsList,
  );
  return objectsList;
};

export const useObjects = (projectId, currentSequenceId) => {
  const objects = useSelector(
    state => state.Project.projects[projectId].sequences[currentSequenceId].objects,
  );
  return objects;
};

export const useCurrentSetup = (projectId) => {
  const currentSetup = useSelector(
    state => (state.Project.projects[projectId] || {}).currentMonitoringSetup,
  ) || [];
  const currentSetupDevices = currentSetup.devices || [];
  return currentSetupDevices;
};

export const useMuteDevices = () => {
  const muteDevices = useSelector(state => state.Monitoring.muteDevices);
  return muteDevices;
};

export const useSoloDevices = () => {
  const soloDevices = useSelector(state => state.Monitoring.soloDevices);
  return soloDevices;
};

export const useAlgorithmResults = () => {
  const algorithmResults = useSelector(state => state.Monitoring.previousResults);
  return algorithmResults;
};

export const useSavedSetups = (projectId) => {
  const savedSetups = useSelector(
    state => (state.Project.projects[projectId] || {}).savedMonitoringSetups || [],
  );
  return savedSetups;
};

export const useConnectedToDAW = () => {
  const connectedToDAW = useSelector(state => state.Monitoring.connectedToDAW);
  return connectedToDAW;
};

export const useConnectedToDAWOnce = () => {
  const connectedToDAWOnce = useSelector(state => state.Monitoring.connectedToDAWOnce);
  return connectedToDAWOnce;
};

export const useOSCPortNumber = () => {
  const portNumber = useSelector(state => state.Monitoring.OSCSettings.portNumber);
  return portNumber;
};

export const useOSCFormat = () => {
  const OSCFormat = useSelector(state => state.Monitoring.OSCSettings.format);
  return OSCFormat;
};

export const useCurrentSequenceId = (projectId) => {
  let currentSequenceId = useSelector(state => state.UI.currentSequenceId);
  const sequencesList = useSelector(state => state.Project.projects[projectId].sequencesList);
  // If currentSequenceId is null (no tab has been opened in the audio page, or the sequence
  // that was open has been deleted) then use the first sequence in sequencesList
  const defaultSequenceId = ((sequencesList || [])[0] || {}).sequenceId;
  currentSequenceId = currentSequenceId || defaultSequenceId;
  return currentSequenceId;
};

export const getDefaultOrCurrentControlValues = (controls, device, controlId) => {
  if (device.controlValues) {
    if (device.controlValues[controlId]) {
      return device.controlValues[controlId];
    }
  }
  return controls[controlId].controlDefaultValues;
};

export const getDeviceCurrentNumber = (device, currentSetup) => (
  currentSetup.filter((
    d => (
      d.switchedOn === true
      && d.joiningNumber <= device.joiningNumber
    )
  )).length
);

/**
 * Functions to create updated saved setups and current setup objects,
 * which can then be sent to the project action
*/
export const addDeviceToMonitoringSetup = (
  option,
  numberOfDevices,
  currentSetup,
) => {
  const newDevice = {
    deviceId: uuidv4(),
    deviceType: option.value,
    displayName: option.displayName,
    joiningNumber: numberOfDevices + 1,
    switchedOn: true,
    controlValues: null,
  };
  const currentMonitoringSetup = {
    name: 'current setup',
    id: uuidv4(),
    devices: [...currentSetup, newDevice],
  };
  return currentMonitoringSetup;
};

export const deleteAllDevices = (mainDevice) => {
  const currentMonitoringSetup = {
    name: 'current setup',
    id: uuidv4(),
    devices: [mainDevice],
  };
  return currentMonitoringSetup;
};

export const deleteOneDevice = (id, currentSetup) => {
  const currentMonitoringSetup = {
    name: 'current setup',
    id: uuidv4(),
    devices: currentSetup.filter(
      ({ deviceId }) => deviceId !== id,
    ),
  };
  return currentMonitoringSetup;
};

export const deleteSavedSetup = (setupId, savedSetups) => {
  const savedMonitoringSetups = savedSetups.filter(
    ({ id }) => id !== setupId,
  );
  return savedMonitoringSetups;
};

const replaceDevice = (changedDevice, currentSetup) => {
  const currentMonitoringSetup = {
    name: 'current setup',
    id: uuidv4(),
    devices: currentSetup.map(
      (device) => {
        if (device.deviceId === changedDevice.deviceId) {
          return changedDevice;
        }
        return device;
      },
    ),
  };
  return currentMonitoringSetup;
};

export const changeDeviceType = (option, deviceToChange, currentSetup) => {
  const changedDevice = {
    ...deviceToChange,
    deviceType: option.value,
    displayName: option.displayName,
  };
  return replaceDevice(changedDevice, currentSetup);
};

export const toggleDeviceOnOff = (switchedOnStatus, deviceToChange, currentSetup) => {
  const changedDevice = {
    ...deviceToChange,
    switchedOn: !switchedOnStatus,
  };
  return replaceDevice(changedDevice, currentSetup);
};

export const replaceDeviceControlValues = (values, controlId, deviceToChange, currentSetup) => {
  // For radio, checkbox and slider control types
  const changedDevice = {
    ...deviceToChange,
    controlValues: {
      ...deviceToChange.controlValues,
      [controlId]: values,
    },
  };
  return replaceDevice(changedDevice, currentSetup);
};

export const resetControls = (deviceToChange, currentSetup) => {
  const changedDevice = {
    ...deviceToChange,
    controlValues: null,
  };
  return replaceDevice(changedDevice, currentSetup);
};
