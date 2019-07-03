// Top level, can be home (list of projects) or an open project):
export const PAGE_HOME = 'home';
export const PAGE_PROJECT = 'project';

// Second level, one of the pages within the PAGE_PROJECT (requires a currentProjectId to be set):
export const PAGE_PROJECT_SEQUENCES = 'sequences';
export const PAGE_PROJECT_RULES = 'rules';
export const PAGE_PROJECT_PRESENTATION = 'presentation';
export const PAGE_PROJECT_ADVANCED = 'advanced';
export const PAGE_PROJECT_REVIEW = 'review';

// Initial state, home page without an open project or sequence opened.
const initialState = {
  currentPage: PAGE_HOME,
  currentProjectId: null,
  currentProjectPage: PAGE_PROJECT_SEQUENCES,
  currentSequenceId: null,
  tasks: {},
  sequenceAudioConfirmation: null,
  sequenceAudioError: null,
  sequenceMetadataConfirmation: null,
  sequenceMetadataError: null,
};

const UIReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UI_OPEN_PROJECT_PAGE':
      return {
        ...state,
        currentPage: PAGE_PROJECT,
        currentProjectId: action.projectId,
        currentProjectPage: action.projectPage || PAGE_PROJECT_SEQUENCES,
      };
    case 'UI_CLOSE_PROJECT_PAGE':
      return {
        ...state,
        currentPage: PAGE_HOME,
        currentProjectId: null,
        currentSequenceId: null,
      };
    case 'UI_OPEN_SEQUENCE_PAGE':
      return {
        ...state,
        currentPage: PAGE_PROJECT,
        currentProjectPage: PAGE_PROJECT_SEQUENCES,
        currentProjectId: action.projectId,
        currentSequenceId: action.sequenceId,
        sequenceAudioConfirmation: null,
        sequenceAudioError: null,
        sequenceMetadataConfirmation: null,
        sequenceMetadataError: null,
      };
    case 'UI_CONFIRM_SEQUENCE_AUDIO_REPLACED':
      return {
        ...state,
        sequenceAudioError: null,
        sequenceAudioConfirmation: action.confirmation,
      };
    case 'UI_SEQUENCE_AUDIO_ERROR':
      return {
        ...state,
        sequenceAudioError: action.error,
        sequenceAudioConfirmation: null,
      };
    case 'UI_CONFIRM_SEQUENCE_METADATA_REPLACED':
      return {
        ...state,
        sequenceMetadataError: null,
        sequenceMetadataConfirmation: action.confirmation,
      };
    case 'UI_SEQUENCE_METADATA_ERROR':
      return {
        ...state,
        sequenceMetadataError: action.error,
        sequenceMetadataConfirmation: null,
      };
    case 'UI_CLOSE_SEQUENCE_PAGE':
      return {
        ...state,
        currentSequenceId: null,
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
