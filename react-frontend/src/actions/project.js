import LocalProjectStore from '../lib/LocalProjectStore';

const ProjectStore = window.ProjectStore || LocalProjectStore;

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

export const requestOpenProject = (projectId = null) => (dispatch) => {
  dispatch({ type: 'UI_OPEN_PROJECT_WAITING' });

  ProjectStore.openProject(projectId)
    .then(() => {
      dispatch({ type: 'UI_OPEN_PROJECT' });
    })
    .catch(() => {
      dispatch({ type: 'UI_OPEN_PROJECT_FAILED' });
    });
};

export const requestCreateProject = () => (dispatch) => {
  dispatch({ type: 'UI_OPEN_PROJECT_WAITING' });
  console.log('request create project');

  ProjectStore.createProject()
    .then(() => {
      dispatch({ type: 'UI_OPEN_PROJECT' });
    })
    .catch((e) => {
      console.log(e);
      dispatch({ type: 'UI_CREATE_PROJECT_FAILED' });
    });
};

export const checkFileOpen = () => (dispatch) => {
  dispatch({
    type: 'PROJECT_ALLOW_FILE_OPEN',
    allowFileOpen: ProjectStore.canOpenUnlisted(),
  });
};
