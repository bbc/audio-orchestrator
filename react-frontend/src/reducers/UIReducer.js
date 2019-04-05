const initialState = {
  currentPage: 'home',
  currentProjectId: null,
  tasks: {},
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
    case 'UI_SET_TASK_PROGRESS':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.taskId]: { completed: action.completed, total: action.total },
        },
      };
    default:
      return state;
  }
};

export default UIReducer;
