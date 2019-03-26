const initialState = {
  currentPage: 'projects-list',
  currentProjectId: null,
};

const UIReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UI_OPEN_PROJECT':
      return {
        ...state,
        currentPage: 'project',
        currentProjectId: action.projectId,
      };
    case 'UI_CLOSE_PROJECT':
      return {
        ...state,
        currentPage: 'projects-list',
        currentProjectId: null,
      };
    default:
      return state;
  }
};

export const openProject = () => ({
  type: 'UI_OPEN_PROJECT',
});

export const closeProject = () => ({
  type: 'UI_CLOSE_PROJECT',
});

export default UIReducer;
