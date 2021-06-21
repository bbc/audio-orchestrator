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
