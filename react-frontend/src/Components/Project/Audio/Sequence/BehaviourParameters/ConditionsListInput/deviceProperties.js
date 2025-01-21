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
*//* eslint-disable max-len */
// As specified in bbcat-orchestration/schemas/device.json
const deviceProperties = [
  {
    name: 'deviceIsMain',
    displayName: 'Main device',
    description: 'True if this device is the main device (the device that manages playback and allocations)',
    type: 'bool',
  },
  {
    name: 'deviceType',
    displayName: 'Device type',
    description: 'Device type as detected by the application',
    type: 'deviceType',
  },
  {
    name: 'deviceJoiningNumber',
    displayName: 'Joining number',
    description: 'Original position in the joining order, 1-based',
    type: 'number',
  },
  {
    name: 'deviceCurrentNumber',
    displayName: 'Current number',
    description: 'Current position in the joining order, 1-based',
    type: 'number',
  },
  {
    name: 'objectIds',
    displayName: 'Objects allocated to same device',
    description: 'Any of the objects that have been allocated to the device so far, up to the current object',
    type: 'object',
  },
];

export default deviceProperties;
