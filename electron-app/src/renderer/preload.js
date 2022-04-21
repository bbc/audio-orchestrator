import { ipcRenderer, contextBridge } from 'electron';

// To trigger moving and opening exported files
contextBridge.exposeInMainWorld('exportFunctions', {
  openInFolder: (...args) => ipcRenderer.invoke('open-in-folder', ...args),
  saveExportAs: (...args) => ipcRenderer.invoke('save-export-as', ...args),
  saveExportToDownloads: (...args) => ipcRenderer.invoke('save-export-to-downloads', ...args),
  selectCustomTemplatePath: (...args) => ipcRenderer.invoke('select-custom-template-path', ...args),
});

// For accessing background services (previously HTTP API)
contextBridge.exposeInMainWorld('backgroundTaskFunctions', {
  get: path => ipcRenderer.invoke('background-tasks-get', path),
  post: (path, data) => ipcRenderer.invoke('background-tasks-post', path, data),
  delete: path => ipcRenderer.invoke('background-tasks-delete', path),
});

// For project store
contextBridge.exposeInMainWorld('projectStoreFunctions', {
  listProjects: () => ipcRenderer.invoke('project-list'),
  createProject: () => ipcRenderer.invoke('project-create'),
  saveProject: (projectId, project) => ipcRenderer.invoke('project-save', projectId, project),
  removeRecentProject: projectId => ipcRenderer.invoke('project-remove-recent', projectId),
  openProject: projectId => ipcRenderer.invoke('project-open', projectId),
});

// For monitoring system
contextBridge.exposeInMainWorld('monitoringFunctions', {
  sendOSC: (OSCMessages, portNumber) => ipcRenderer.invoke('monitoring-send-osc', OSCMessages, portNumber),
  getOSCSettings: () => ipcRenderer.invoke('monitoring-get-osc-settings'),
  setOSCSettings: settings => ipcRenderer.invoke('monitoring-set-osc-settings', settings),
});

// Other methods
contextBridge.exposeInMainWorld('miscFunctions', {
  openCredits: () => ipcRenderer.invoke('open-credits'),
  openUrl: url => ipcRenderer.invoke('open-url', url),
  getPlatformInfo: () => ipcRenderer.invoke('get-platform-info'),
});
