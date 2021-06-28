import uuidv4 from 'uuid';

const makeDevice = (joiningNumber, deviceType, displayName) => ({
  deviceId: uuidv4(),
  deviceType,
  displayName,
  joiningNumber,
  switchedOn: true,
  controlValues: null,
});

const makeMultipleDevices = (firstJoiningNumber, lastJoiningNumber, deviceType, displayName) => {
  const devices = [];
  for (let i = firstJoiningNumber; i <= lastJoiningNumber; i += 1) {
    devices.push(makeDevice(i, deviceType, displayName));
  }
  return devices;
};

export const presetMonitoringSetups = [
  {
    name: '(Preset) 3: Desktop/laptop main with 2 aux mobiles',
    id: uuidv4(),
    devices: [
      makeDevice(1, 'desktop', 'Desktop/Laptop'),
      makeDevice(2, 'mobile', 'Mobile'),
      makeDevice(3, 'mobile', 'Mobile'),
    ],
  },
  {
    name: '(Preset) 5: Mobile main with 4 mobile and tablet aux devices',
    id: uuidv4(),
    devices: [
      makeDevice(1, 'mobile', 'Mobile'),
      makeDevice(2, 'mobile', 'Mobile'),
      makeDevice(3, 'tablet', 'Tablet'),
      makeDevice(4, 'mobile', 'Mobile'),
      makeDevice(5, 'tablet', 'Tablet'),
    ],
  },
  {
    name: '(Preset) 30: Desktop/laptop main with 29 aux mobiles',
    id: uuidv4(),
    devices: [
      makeDevice(1, 'desktop', 'Desktop/Laptop'),
      ...makeMultipleDevices(2, 30, 'mobile', 'Mobile'),
    ],
  },
];

export default presetMonitoringSetups;
