import EventEmitter from 'events';

const logger = console;
const { projectStoreFunctions } = window;

const openProjectStores = {};

const saveEmitter = new EventEmitter();

/**
 * Creates a project store from a unique project id and optionally set its name
 */
function createProjectStore(projectId, name) {
  if (projectId in openProjectStores) {
    logger.debug(`createProjectStore: ${projectId} is already open, returning existing store.`);
    return {
      projectId,
      store: openProjectStores[projectId],
    };
  }

  logger.debug(`createProjectStore: going to open a project with projectId ${projectId}`);

  // TODO decide whether to store JSON encoded strings or JS objects
  // - using objects should reduce parsing/stringifying overhead
  // - using JSON means we avoid issues when users assign to properties of a returned object

  return projectStoreFunctions.openProject(projectId).then(({
    cancelled,
    project: initialProject,
  }) => {
    if (cancelled) {
      // if the user cancelled the open-file dialog, return a flag and do nothing else.
      return { cancelled: true };
    }
    const project = initialProject;
    const actualProjectId = project.projectId;

    const SAVE_PERIOD = 300; // only save once every 300ms at most
    let saveTimeout = 0;
    let lastSave = 0;

    const save = () => {
      clearTimeout(saveTimeout);
      saveEmitter.emit(`saving-${actualProjectId}`);
      const now = Date.now();

      if (now - lastSave > SAVE_PERIOD) {
        lastSave = now;
        projectStoreFunctions.saveProject(actualProjectId, project)
          .then(() => {
            saveEmitter.emit(`saved-${actualProjectId}`);
          })
          .catch((e) => {
            logger.error('project-save IPC call failed', e);
            saveEmitter.emit(`error-${actualProjectId}`);
          });
      } else {
        saveTimeout = setTimeout(save, SAVE_PERIOD);
      }
    };

    const store = {
      set: (projectKey, value) => {
        project[projectKey] = value;
        // TODO return value of promise is ignored
        // TODO what happens if multiple writes are in progress?
        save();
      },
      get: (projectKey, defaultValue) => {
        if (project[projectKey] === undefined) {
          return defaultValue;
        }
        return project[projectKey];
      },
      has: projectKey => (project[projectKey] !== undefined),
      delete: (projectKey) => { // delete, not remove, to match electron-store API.
        delete project[projectKey];
        save();
      },
    };

    store.set('lastOpened', new Date().toISOString());
    if (!store.has('name')) {
      store.set('name', name);
    }

    logger.debug(`returning projectId and store for ${actualProjectId}`);
    return {
      projectId: actualProjectId,
      store,
    };
  });
}

/**
 * The IPC project store caches project data in memory after loading it from a project file; and
 * saves any changes by writing the entire project back to the file.
 */
class IpcProjectStore {
  /**
   * Open a project.
   *
   * Returns a promise resolving to project store object
   * @param {string} [projectId] - if set, open the project identified by that Id. Otherwise, show
   * a file open dialogue.
   * @returns {Promise<Object>} - Resolves to an object with projectId and store keys
   */
  static openProject(projectId) {
    return createProjectStore(projectId);
  }

  /**
   * Create a new project with the given name. This will show a save as... dialogue to create a
   * project file.
   * @returns {Promise<Object>} - Resolves to an object with projectId and store keys
   */
  static createProject(name = 'Untitled Project') {
    return projectStoreFunctions.createProject()
      .then(({ cancelled, projectId }) => {
        if (cancelled) {
          logger.debug('user cancelled project creation');
          return { cancelled: true };
        }
        logger.debug(`Created project with id ${projectId}`);
        return createProjectStore(projectId, name);
      });
  }

  /**
   * Provide a list of projects that can be opened without requiring a file open dialog.
   *
   * @returns {Promise<Array<Object>>}
   */
  static listProjects() {
    return projectStoreFunctions.listProjects();
  }

  static canOpenUnlisted() {
    return true;
  }

  static deleteProject(projectId) {
    return projectStoreFunctions.removeRecentProject(projectId);
  }

  static dumpProjectData() {
    throw new Error('cannot dump project data when using IpcProjectStore (it would be the same as saving the project)');
  }

  static importProjectData() {
    throw new Error('cannot import project data when using IpcProjectStore (it would be the same as opening a project)');
  }

  static on(...args) {
    saveEmitter.on(...args);
  }

  static removeAllListeners(...args) {
    saveEmitter.removeAllListeners(...args);
  }
}

export default IpcProjectStore;
