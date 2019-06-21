import uuidv4 from 'uuid/v4';

const CURRENT_PROJECT_STORE_VERSION = 1;
const Storage = window.localStorage;

/**
 * Creates a project store from a unique project id and optionally set its name
 */
function createProjectStore(projectId, name) {
  const store = {
    set: (projectKey, value) => {
      const key = `projects.${projectId}.${projectKey}`;
      Storage.setItem(key, JSON.stringify(value));
    },
    get: (projectKey, defaultValue) => {
      const key = `projects.${projectId}.${projectKey}`;
      if (!Storage.getItem(key)) {
        return defaultValue;
      }
      return JSON.parse(Storage.getItem(key));
    },
    has: (projectKey) => {
      const key = `projects.${projectId}.${projectKey}`;
      return !!Storage.getItem(key);
    },
    delete: (projectKey) => { // delete, not remove, to match electron-store API.
      const key = `projects.${projectId}.${projectKey}`;
      Storage.removeItem(key);
    },
  };

  const projectStoreVersion = store.get('_PROJECT_STORE_VERSION', 0);
  if (projectStoreVersion < CURRENT_PROJECT_STORE_VERSION) {
    console.warn(`Mismatched project store version, migration from version ${projectStoreVersion} to ${CURRENT_PROJECT_STORE_VERSION} is a no-op.`);
    store.set('_PROJECT_STORE_VERSION', CURRENT_PROJECT_STORE_VERSION);
  }

  store.set('lastOpened', new Date().toISOString());
  if (!store.has('name')) {
    store.set('name', name);
  }

  return store;
}

/**
 * The local project store keeps project data in the browser's localStorage, and mirrors the API
 * provided by the Electron project store.
 */
class LocalProjectStore {
  /**
   * Open a project.
   *
   * Return the project data store if a valid project is selected. Reject the returned promise
   * if the projectId does not exist.
   *
   * @returns {Promise<Store>}
   */
  static openProject(projectId) {
    return new Promise((resolve, reject) => {
      if (!Storage.getItem(`projects.${projectId}.lastOpened`)) {
        reject(new Error('Requested project does not exist.'));
        return;
      }

      const store = createProjectStore(projectId);
      resolve(store);
    });
  }

  /**
   * Create a new project with the given name.
   */
  static createProject(name = 'Untitled Project') {
    return new Promise((resolve) => {
      const projectId = uuidv4();

      // Add the projectId to the stored list of ids, so we can iterate through projects later,
      // by adding it to the previously stored list (or the empty list if there is none).
      Storage.setItem('projectIds', JSON.stringify([
        ...(JSON.parse(Storage.getItem('projectIds')) || []),
        projectId,
      ]));

      // Create a store object to mask the backing storage and the projectId
      const store = createProjectStore(projectId, name);

      // resolve the promise to the new store object.
      resolve({ projectId, store });
    });
  }

  /**
   * Provide a list of projects that can be opened without requiring a file open dialog.
   *
   * @returns {Promise<Array<Object>>}
   */
  static listProjects() {
    const projectIds = JSON.parse(Storage.getItem('projectIds')) || [];

    return Promise.resolve(
      projectIds
        .filter(projectId => !!Storage.getItem(`projects.${projectId}.lastOpened`))
        .map(projectId => ({
          projectId,
          lastOpened: JSON.parse(Storage.getItem(`projects.${projectId}.lastOpened`)),
          name: JSON.parse(Storage.getItem(`projects.${projectId}.name`)),
        })),

    );
  }

  /**
   * Deletes the project entries from the store and projects list.
   */
  static deleteProject(projectId) {
    const projectIds = JSON.parse(Storage.getItem('projectIds')) || [];
    Storage.setItem('projectIds', JSON.stringify(projectIds.filter(p => p !== projectId)));
    Storage.removeItem(`projects.${projectId}._PROJECT_STORE_VERSION`);
  }

  static canOpenUnlisted() {
    return false;
  }

  static dumpProjectData(projectId) {
    const dump = {
      dumpDate: new Date().toISOString(),
      projectIds: [projectId],
    };

    for (let i = 0; i < Storage.length; i += 1) {
      const key = Storage.key(i);
      if (key.startsWith(`projects.${projectId}.`)) {
        dump[key] = JSON.parse(Storage.getItem(key));
      }
    }

    return dump;
  }

  static importProjectData(dump) {
    const existingProjectIds = JSON.parse(Storage.getItem('projectIds')) || [];
    dump.projectIds.forEach((projectId) => {
      // generate a new project id to avoid overwriting an existing one
      let newProjectId = projectId;
      if (existingProjectIds.includes(projectId)) {
        newProjectId = uuidv4();
      }

      // copy each key into the store
      Object.keys(dump)
        .filter(key => key.startsWith(`projects.${projectId}.`))
        .forEach((key) => {
          const newKey = key.replace(`projects.${projectId}.`, `projects.${newProjectId}.`);
          Storage.setItem(newKey, JSON.stringify(dump[key]));
        });

      // append new project id to list of projects
      Storage.setItem('projectIds', JSON.stringify([
        ...(JSON.parse(Storage.getItem('projectIds')) || []),
        newProjectId,
      ]));
    });
  }
}

export default LocalProjectStore;
