import path from 'path';
import Store from 'electron-store';
import { remote } from 'electron';

const { dialog, getCurrentWindow } = remote;

/**
 * File extensions allowed for project files.
 */
const fileFilters = [{ name: 'Project Files', extensions: ['bbcat-orchestration-project'] }];

/**
 * Creates a project store from a path, creating or loading the config file there.
 */
function createProjectStore(selectedPath) {
  const fileExtension = path.extname(selectedPath);
  const name = path.basename(selectedPath, fileExtension);
  const cwd = path.dirname(selectedPath);

  console.log(selectedPath, fileExtension, name, cwd);

  const store = new Store({
    cwd,
    name,
    fileExtension: fileExtension.substr(1),
    clearInvalidConfig: false,
  });

  store.set('lastOpened', new Date().toISOString());
  if (!store.has('name')) {
    store.set('name', name);
  }

  return store;
}

/**
 * The project library wraps the electron native dialogs and file system APIs and mirrors the local
 * storage implementation used in the web interface. All method calls return Promises.
 */
class ProjectStore {
  /**
   * Open an "Open File" dialog, and parse the selected file as project data.
   *
   * Return the project data store if a valid project file is selected. Reject the returned promise
   * if the user cancels or selects an invalid file.
   *
   * @returns {Promise<Store>}
   */
  static openProject() {
    return new Promise((resolve, reject) => {
      dialog.showOpenDialog(
        getCurrentWindow(), {
          title: 'Open Project',
          properties: ['openFile'],
          filters: fileFilters,
        },
        (filePaths) => {
          console.log(filePaths === undefined);

          // Make sure the user actually selected a file.
          if (filePaths === undefined || filePaths.length === 0) {
            reject(new Error('No file selected.'));
            return;
          }

          // Create a Store object backed by the selected file.
          const store = createProjectStore(filePaths[0]);

          // resolve the promise to the parsed store object.
          resolve(store);
        },
      );
    });
  }

  /**
   * Open a "Save File As..." dialog and create a new config store.
   * If an existing file is selected, however, this will be opened.
   */
  static createProject(name='Untitled Project') {
    return new Promise((resolve, reject) => {
      dialog.showSaveDialog(
        getCurrentWindow(),
        {
          title: 'Create Project',
          filters: fileFilters,
          defaultPath: name,
        }, (fileName) => {
          // Make sure the user actually selected a file.
          if (fileName === undefined) {
            reject(new Error('No file selected.'));
            return;
          }

          // Create a Store object backed by the selected file.
          const store = createProjectStore(fileName);

          // resolve the promise to the parsed store object.
          resolve(store);
        },
      );
    });
  }

  /**
   * Provide a list of projects that can be opened without requiring a file open dialog.
   *
   * Not implemented in the Electron version, designed for using a database or browser-based
   * storage solution.
   *
   * TODO: Consider an implementation using an MRU list.
   *
   * @returns {Promise<Array<Object>>}
   */
  static listProjects() {
    return Promise.resolve([]);
  }

  static canOpenUnlisted() {
    return true;
  }
}

export default ProjectStore;
