import LocalProjectStore from '../lib/LocalProjectStore';

const ProjectStore = window.ProjectStore || LocalProjectStore;
let currentProject = null;

/**
 * Action creator, closes the current project
 * Dereferences the project store and resets the UI to the home page.
 */
export const closeProject = () => (dispatch) => {
  currentProject = null;
  dispatch({ type: 'UI_CLOSE_PROJECT' });
  dispatch({ type: 'SET_PROJECT_LOADING', loading: false });
  dispatch({ type: 'PROJECT_CLOSE' });
};

export const requestListProjects = () => (dispatch) => {
  dispatch({ type: 'PROJECT_PROJECTS_LIST_LOADING' });

  ProjectStore.listProjects()
    .then((projectsList) => {
      dispatch({
        type: 'PROJECT_RECEIVED_PROJECTS_LIST',
        projectsList,
      });
    })
    .catch(() => {
      dispatch({ type: 'PROJECT_PROJECTS_LIST_FAILED' });
    });
};

/**
 * Action creator, populates the state with info from the opened project and updates the UI.
 */
const openedProject = () => (dispatch) => {
  // Move onto the project page
  dispatch({ type: 'UI_OPEN_PROJECT' });

  // Set the project name
  dispatch({ type: 'SET_PROJECT_NAME', name: currentProject.get('name') });

  // Hide the loading indicator
  dispatch({ type: 'SET_PROJECT_LOADING', loading: false });
};

/**
 * Action creator, opens a specified project from the store (or triggers a file-open dialogue).
 */
export const requestOpenProject = (projectId = null) => (dispatch) => {
  dispatch({ type: 'SET_PROJECT_LOADING', loading: true });

  ProjectStore.openProject(projectId)
    .then((store) => {
      currentProject = store;
      dispatch(openedProject());
    })
    .catch((e) => {
      console.info(e);
      dispatch(closeProject());
    });
};

/**
 * Action creator, creates a new project in the store (or triggers a file-save dialogue).
 */
export const requestCreateProject = () => (dispatch) => {
  dispatch({ type: 'SET_PROJECT_LOADING', loading: true });

  ProjectStore.createProject()
    .then((store) => {
      currentProject = store;
      dispatch(openedProject());
    })
    .catch((e) => {
      console.info(e);
      dispatch(closeProject());
    });
};

/**
 * Action creator, updates the state with whether the backing store supports opening unlisted
 * projects (using a native file-open dialogue).
 */
export const checkFileOpen = () => (dispatch) => {
  dispatch({
    type: 'PROJECT_ALLOW_FILE_OPEN',
    allowFileOpen: ProjectStore.canOpenUnlisted(),
  });
};

/**
 * Action creator, sets the current project's name.
 */
export const setProjectName = name => (dispatch) => {
  if (!currentProject) throw new Error('No project open.');

  currentProject.set('name', name);
  dispatch({ type: 'SET_PROJECT_NAME', name });
};

/**
 * Action creator, changes a single value in the current project's settings.
 */
export const setProjectSetting = (key, value) => (dispatch) => {
  if (!currentProject) throw new Error('No project open.');

  const settings = currentProject.get('settings', {});
  const newSettings = { ...settings, [key]: value };
  currentProject.set('settings', newSettings);

  dispatch({ type: 'SET_PROJECT_SETTINGS', settings: newSettings });
};

export const getProjectSettings = () => (dispatch) => {
  if (!currentProject) throw new Error('No project open.');

  dispatch({ type: 'SET_PROJECT_SETTINGS_LOADING', loading: true });
  dispatch({ type: 'SET_PROJECT_SETTINGS', settings: currentProject.get('settings', {}) });
  dispatch({ type: 'SET_PROJECT_SETTINGS_LOADING', loading: false });
};
