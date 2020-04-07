import { ipcRenderer } from 'electron';

ipcRenderer.invoke('get-working-directories').then(({ cwd, homedir }) => {
  console.info(`current working directory: ${cwd}`);
  console.info(`log file location: ${homedir}`);
});

ipcRenderer.invoke('get-api-url').then((apiUrl) => {
  window.API_URL = apiUrl;
});

window.openUrl = (...args) => ipcRenderer.invoke('open-url', ...args);
window.openInFolder = (...args) => ipcRenderer.invoke('open-in-folder', ...args);
window.saveExportAs = (...args) => ipcRenderer.invoke('save-export-as', ...args);
window.saveExportToDownloads = (...args) => ipcRenderer.invoke('save-export-to-downloads', ...args);

window.openDevTools = () => ipcRenderer.invoke('open-dev-tools');
window.openCredits = () => ipcRenderer.invoke('open-credits');
