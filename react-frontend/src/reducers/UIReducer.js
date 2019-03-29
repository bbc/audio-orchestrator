const initialState = {
  currentPage: 'home',
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
        currentPage: 'home',
        currentProjectId: null,
      };
    default:
      return state;
  }
};

export default UIReducer;
