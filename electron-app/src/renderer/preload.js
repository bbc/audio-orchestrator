import { ipcRenderer } from 'electron';

// Just for debugging, log the working directories
ipcRenderer.invoke('get-working-directories').then(({ cwd, homedir }) => {
  console.info(`current working directory: ${cwd}`);
  console.info(`log file location: ${homedir}`);
});

// To trigger moving and opening exported files
window.openUrl = (...args) => ipcRenderer.invoke('open-url', ...args);
window.openInFolder = (...args) => ipcRenderer.invoke('open-in-folder', ...args);
window.saveExportAs = (...args) => ipcRenderer.invoke('save-export-as', ...args);
window.saveExportToDownloads = (...args) => ipcRenderer.invoke('save-export-to-downloads', ...args);

// For developer menu
window.openDevTools = () => ipcRenderer.invoke('open-dev-tools');
window.openCredits = () => ipcRenderer.invoke('open-credits');

// For accessing background services (previously HTTP API)
window.backgroundTasksIpcService = {
  get: path => ipcRenderer.invoke('background-tasks-get', path),
  post: (path, data) => ipcRenderer.invoke('background-tasks-post', path, data),
  delete: path => ipcRenderer.invoke('background-tasks-delete', path),
};
