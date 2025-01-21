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
*/

import Store from 'electron-store';

const settingsStore = new Store();

export const getRecentProjects = () => {
  const recentProjects = settingsStore.get('recentProjects', []);

  // Sort by most recently opened first, lastOpened should be ISO date strings
  recentProjects.sort((a, b) => Date.parse(b.lastOpened) - Date.parse(a.lastOpened));

  // Only show the 15 most recently opened - arbitrary cut-off
  return recentProjects.slice(0, 15);
};

export const setRecentProject = (projectId, projectFilePath, name) => {
  settingsStore.set('recentProjects', [
    ...getRecentProjects().filter(p => p.projectFilePath !== projectFilePath),
    {
      projectId,
      projectFilePath,
      name,
      lastOpened: new Date().toISOString(),
    },
  ]);
};

export const removeRecentProject = (projectFilePath) => {
  settingsStore.set('recentProjects', getRecentProjects().filter(p => p.projectFilePath !== projectFilePath));
};

export const getOSCSettings = () => settingsStore.get('OSCSettings', null);

export const setOSCSettings = ({ portNumber, format }) => {
  settingsStore.set('OSCSettings', {
    portNumber,
    format,
  });
};
