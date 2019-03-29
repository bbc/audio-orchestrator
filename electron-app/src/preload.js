import { ipcRenderer } from 'electron';
import ProjectStore from './project-store';

window.API_URL = ipcRenderer.sendSync('GET_API_URL');

// TODO: For easier manual testing, use the local storage implementation for now.
// window.ProjectStore = ProjectStore;
