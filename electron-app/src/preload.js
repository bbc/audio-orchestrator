import os from 'os';
import { ipcRenderer, remote } from 'electron';
import ProjectStore from './project-store';
import {
  openUrl,
  openInFolder,
  saveExportAs,
  saveExportToDownloads,
} from './save-exports';


console.info(`current working directory: ${remote.process.cwd()}`);
console.info(`log file location: ${os.homedir()}`);

window.API_URL = ipcRenderer.sendSync('GET_API_URL');

// TODO: For easier manual testing, use the local storage implementation for now.
// window.ProjectStore = ProjectStore;

window.openUrl = openUrl;
window.openInFolder = openInFolder;
window.saveExportAs = saveExportAs;
window.saveExportToDownloads = saveExportToDownloads;
