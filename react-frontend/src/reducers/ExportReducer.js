const initialState = {
  title: '',
  stepTitle: '',
  error: null,
  running: false,
  complete: false,
  failed: false,
  progressPercent: 0,
  closed: false,
  outputPath: null,
};

const ExportReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'EXPORT_START':
      return {
        ...initialState,
        running: true,
        title: action.title,
        stepTitle: 'Preparing...',
      };
    case 'EXPORT_CLOSE':
      return {
        ...state,
        closed: true,
      };
    case 'EXPORT_FAIL':
      return {
        ...state,
        failed: true,
        running: false,
        error: action.error,
      };
    case 'EXPORT_COMPLETE':
      return {
        ...state,
        complete: true,
        running: false,
        progressPercent: 100,
        outputPath: action.outputPath,
      };
    case 'EXPORT_PROGRESS':
      return {
        ...state,
        progressPercent: action.progressPercent,
        stepTitle: action.stepTitle,
      };
    default:
      return state;
  }
};

export default ExportReducer;
