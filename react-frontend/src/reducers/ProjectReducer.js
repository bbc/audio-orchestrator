const initialState = {
  projectsList: [],
  projectsListLoading: false,
  allowFileOpen: false,
  settings: {},
  settingsLoading: false,
};

const ProjectReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PROJECT_PROJECTS_LIST_LOADING':
      return { ...state, projectsListLoading: true };
    case 'PROJECT_RECEIVED_PROJECTS_LIST':
      return {
        ...state,
        projectsListLoading: false,
        projectsList: action.projectsList,
      };
    case 'PROJECT_PROJECTS_LIST_FAILED':
      return {
        ...state,
        projectsListLoading: false,
        projectsList: [],
      };
    case 'PROJECT_ALLOW_FILE_OPEN':
      return { ...state, allowFileOpen: action.allowFileOpen };
    case 'SET_PROJECT_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_PROJECT_NAME':
      return { ...state, name: action.name };
    case 'SET_PROJECT_SETTINGS_LOADING':
      return { ...state, settingsLoading: action.loading };
    case 'SET_PROJECT_SETTINGS':
      return { ...state, settings: action.settings };
    default:
      return state;
  }
};

export default ProjectReducer;
