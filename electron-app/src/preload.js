import { ipcRenderer } from 'electron';
import ProjectStore from './project-store';

window.API_URL = ipcRenderer.sendSync('GET_API_URL');
window.ProjectStore = ProjectStore;
