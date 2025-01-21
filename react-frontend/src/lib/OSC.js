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
*//**
 * constants
 */
export const REAPER = 'REAPER';
export const MIEM_MATRIX_L_R = 'MIEM_MATRIX_L_R';

export const defaultOSCSettings = {
  portNumber: 8000,
  format: REAPER,
};

export const setOSCSettings = (settings) => window.monitoringFunctions.setOSCSettings(settings);

/**
 * Functions to create OSC message objects and send them over UDP
 */
const range = (start, end) => {
  const arr = [];
  for (let i = start; i <= end; i += 1) {
    arr.push(i);
  }
  return arr;
};

const convertAlgorithmOutput = (
  algorithmOutput,
  objects,
  currentSetup,
  muteDevices,
  soloDevices,
) => {
  // objects is passed from state as an argument
  const convertedAlgorithmOutput = {
    // To use with MIEM per device method
    objectsAllocatedByDevice: {},
    objectNumbersToMute: [],
    objectNumbersToUnmute: [],
    objectNumbersToSolo: [],
    objectNumbersToUnsolo: [],
    solo: false,
    allObjectNumbers: [],
  };
  // Create a list of object numbers to unmute
  // (that are on unmuted devices and have been allocated)
  Object.keys(algorithmOutput.allocations).forEach((deviceId) => {
    if (!muteDevices.includes(deviceId)) {
      algorithmOutput.allocations[deviceId].forEach((object) => {
        convertedAlgorithmOutput.objectNumbersToUnmute.push(
          parseInt(object.objectId, 10),
        );
      });
    }
  });
  // Create objectsAllocatedByDevice for MIEM per device method
  // / If no devices have been soloed, then get objects allocated to devices which aren't muted
  if (soloDevices.length === 0) {
    Object.keys(algorithmOutput.allocations).forEach((deviceId) => {
      if (!muteDevices.includes(deviceId)) {
        convertedAlgorithmOutput.objectsAllocatedByDevice[deviceId] = {
          deviceJoiningNumber: currentSetup
            .find((device) => device.deviceId === deviceId).joiningNumber,
          audioObjects: algorithmOutput.allocations[deviceId].map(((object) => ({
            objectNumber: parseInt(object.objectId, 10),
            objectGain: object.objectGain,
          }
          ))),
        };
      }
    });
  } else {
    convertedAlgorithmOutput.solo = true;
    // If a device has been solo-ed, then get objects allocated to all solo-ed devices
    Object.keys(algorithmOutput.allocations).forEach((deviceId) => {
      if (soloDevices.includes(deviceId)) {
        convertedAlgorithmOutput.objectsAllocatedByDevice[deviceId] = {
          deviceJoiningNumber: currentSetup
            .find((device) => (device.deviceId === deviceId)).joiningNumber,
          audioObjects: algorithmOutput.allocations[deviceId].map(((object) => ({
            objectNumber: parseInt(object.objectId, 10),
            objectGain: object.objectGain,
          }
          ))),
        };
        algorithmOutput.allocations[deviceId].forEach((object) => {
          convertedAlgorithmOutput.objectNumbersToSolo.push(
            parseInt(object.objectId, 10),
          );
        });
      }
    });
  }
  // Create a list of all the object numbers in the current sequence
  if (objects) {
    Object.values(objects).forEach((object) => (
      convertedAlgorithmOutput.allObjectNumbers.push(object.objectNumber)
    ));
  }
  // Remove repeats from the objectNumbersToUnmute
  convertedAlgorithmOutput.objectNumbersToUnmute = Array.from(
    new Set(convertedAlgorithmOutput.objectNumbersToUnmute),
  );
  // Remove repeats from the objectNumbersToSolo
  convertedAlgorithmOutput.objectNumbersToSolo = Array.from(
    new Set(convertedAlgorithmOutput.objectNumbersToSolo),
  );
  // Create an array of object numbers to mute
  if (convertedAlgorithmOutput.allObjectNumbers) {
    convertedAlgorithmOutput.objectNumbersToMute = convertedAlgorithmOutput.allObjectNumbers
      .filter((number) => !convertedAlgorithmOutput.objectNumbersToUnmute.includes(number));
  }
  // Create an array of object numbers to unsolo
  if (convertedAlgorithmOutput.allObjectNumbers) {
    convertedAlgorithmOutput.objectNumbersToUnsolo = convertedAlgorithmOutput.allObjectNumbers
      .filter((number) => !convertedAlgorithmOutput.objectNumbersToSolo.includes(number));
  }
  return convertedAlgorithmOutput;
};

const convertObjectToOSCMIEM = (input, output, gain) => (
  {
    address: '/mat',
    args: [
      {
        type: 'integer',
        value: input,
        // This uses the digits at the start of the audio object name
        // if these digits aren't correct and corresponding to the tracks routed to
        // the rows in the matrix plugin
      },
      {
        type: 'integer',
        value: output,
      },
      {
        type: 'float',
        value: gain,
      },
    ],
  }
);

const convertObjectToOSCReaper = (input, value, action) => (
  {
    // input is the track number/audio object number
    // value is either 0 or 1 (1 to do the action e.g. mute, 0 to do the opposite e.g. unmute)
    // action is either 'solo' or 'mute'
    address: `/track/${input}/${action}`,
    args: [
      {
        type: 'integer',
        value,
      },
    ],
  }
);

export const createArrayOfOSCMessages = (
  algorithmOutput,
  objects,
  currentSetup,
  format,
  muteDevices,
  soloDevices,
) => {
  const convertedAlgorithmOutput = convertAlgorithmOutput(
    algorithmOutput,
    objects,
    currentSetup,
    muteDevices,
    soloDevices,
  );
  const OSCMessagesToSend = [];
  switch (format) {
    case MIEM_MATRIX_L_R:
    {
      // TODO - use functions to avoid repetition
      // If there are no soloed devices, unmute objectNumbersToUnmute and mute all others
      if (convertedAlgorithmOutput.solo === false) {
        convertedAlgorithmOutput.objectNumbersToUnmute.forEach((input) => {
          OSCMessagesToSend.push(convertObjectToOSCMIEM(input - 1, 0, 1.0));
          OSCMessagesToSend.push(convertObjectToOSCMIEM(input - 1, 1, 1.0));
        });
        // Then mute all other inputs - could just mute objectNumbersToMute though
        const tracksToTurnOff = range(1, 64).filter((number) => !convertedAlgorithmOutput
          .objectNumbersToUnmute.includes(number));
        tracksToTurnOff.forEach((input) => {
          OSCMessagesToSend.push(convertObjectToOSCMIEM(input - 1, 0, 0.0));
          OSCMessagesToSend.push(convertObjectToOSCMIEM(input - 1, 1, 0.0));
        });
        // If there are soloed devices, unmute objectNumbersToSolo and mute all others
      } else if (convertedAlgorithmOutput.solo === true) {
        convertedAlgorithmOutput.objectNumbersToSolo.forEach((input) => {
          OSCMessagesToSend.push(convertObjectToOSCMIEM(input - 1, 0, 1.0));
          OSCMessagesToSend.push(convertObjectToOSCMIEM(input - 1, 1, 1.0));
        });
        const tracksToTurnOff = range(1, 64).filter((number) => !convertedAlgorithmOutput
          .objectNumbersToSolo.includes(number));
        tracksToTurnOff.forEach((input) => {
          OSCMessagesToSend.push(convertObjectToOSCMIEM(input - 1, 0, 0.0));
          OSCMessagesToSend.push(convertObjectToOSCMIEM(input - 1, 1, 0.0));
        });
      }
      return OSCMessagesToSend;
    }
    case REAPER:
    {
      convertedAlgorithmOutput.objectNumbersToSolo.forEach((input) => {
        OSCMessagesToSend.push(convertObjectToOSCReaper(input, 1, 'solo'));
      });
      convertedAlgorithmOutput.objectNumbersToUnsolo.forEach((input) => {
        OSCMessagesToSend.push(convertObjectToOSCReaper(input, 0, 'solo'));
      });
      convertedAlgorithmOutput.objectNumbersToMute.forEach((input) => {
        OSCMessagesToSend.push(convertObjectToOSCReaper(input, 1, 'mute'));
      });
      convertedAlgorithmOutput.objectNumbersToUnmute.forEach((input) => {
        OSCMessagesToSend.push(convertObjectToOSCReaper(input, 0, 'mute'));
      });
      return OSCMessagesToSend;
    }
    default:
      // Don't send any messages if the format is not defined
      console.error(`unexpected OSC format ${format}`);
      return [];
  }
};

export const sendOSCMsgs = (
  algorithmOutput,
  portNumber,
  objects,
  currentSetup,
  format,
  muteDevices,
  soloDevices,
) => {
  const OSCMessagesToSend = createArrayOfOSCMessages(
    algorithmOutput,
    objects,
    currentSetup,
    format,
    muteDevices,
    soloDevices,
  );
  window.monitoringFunctions.sendOSC(OSCMessagesToSend, portNumber);
};

export const sendOSCMsgsTurnAllTracksOn = (portNumber, format) => {
  switch (format) {
    case MIEM_MATRIX_L_R:
    {
      // Turns on all inputs into matrix - maybe this could be changed to just
      // unmute audio object inputs using allObjectNumbers
      const tracksToTurnOn = range(0, 63);
      const OSCMessagesToSend = [];
      tracksToTurnOn.forEach((input) => {
        OSCMessagesToSend.push(convertObjectToOSCMIEM(input, 0, 1.0));
        OSCMessagesToSend.push(convertObjectToOSCMIEM(input, 1, 1.0));
      });
      return window.monitoringFunctions.sendOSC(OSCMessagesToSend, portNumber);
    }
    case REAPER:
    {
      // do nothing, leave the tracks as they last were
      return null;
    }
    default:
      return 'ERROR';
  }
};

export const sendOSCPlayPause = (portNumber, action) => {
  const OSCMessagesToSend = [];
  OSCMessagesToSend.push({
    // action is either 'play' or 'pause'
    address: `/${action}`,
    args: [],
  });
  window.monitoringFunctions.sendOSC(OSCMessagesToSend, portNumber);
};
