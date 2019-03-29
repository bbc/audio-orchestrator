const Storage = window.localStorage;

/**
 * Creates a project store from a unique project id and optionally set its name
 */
function createProjectStore(projectId, name) {
  const store = {
    set: (projectKey, value) => {
      const key = `projects.${projectId}.${projectKey}`;
      console.log(value);
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
  };

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
      // get the last projectId assigned and increment it (default to 1 if it's the first time)
      const projectId = parseInt((Storage.getItem('lastProjectId') || 0), 10) + 1;
      Storage.setItem('lastProjectId', projectId);

      // Add the projectId to the stored list of ids, so we can iterate through projects later,
      // by adding it to the previously stored list (or the empty list if there is none).
      Storage.setItem('projectIds', JSON.stringify([
        ...(JSON.parse(Storage.getItem('projectIds')) || []),
        projectId,
      ]));

      // Create a store object to mask the backing storage and the projectId
      const store = createProjectStore(projectId, name);

      // resolve the promise to the new store object.
      resolve(store);
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

  static canOpenUnlisted() {
    return false;
  }
}

export default LocalProjectStore;
