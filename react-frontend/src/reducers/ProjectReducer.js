const initialState = {
  projectsList: [],
  projectsListLoading: false,
  allowFileOpen: false,
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
    default:
      return state;
  }
};

export default ProjectReducer;
