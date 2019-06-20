import {
  PAGE_PROJECT_SEQUENCES,
} from '../reducers/UIReducer';

export const openProjectPage = (projectId, projectPage = PAGE_PROJECT_SEQUENCES) => ({
  type: 'UI_OPEN_PROJECT_PAGE',
  projectId,
  projectPage,
});

export const closeProjectPage = () => ({
  type: 'UI_CLOSE_PROJECT_PAGE',
});

export const openSequencePage = (projectId, sequenceId) => ({
  type: 'UI_OPEN_SEQUENCE_PAGE',
  projectId,
  sequenceId,
});

export const closeSequencePage = () => ({
  type: 'UI_CLOSE_SEQUENCE_PAGE',
});

export const setTaskProgress = (taskId, completed, total) => ({
  type: 'UI_SET_TASK_PROGRESS',
  taskId,
  completed,
  total,
});

export const confirmSequenceAudioReplaced = confirmation => ({
  type: 'UI_CONFIRM_SEQUENCE_AUDIO_REPLACED',
  confirmation,
});

export const confirmSequenceMetadataReplaced = confirmation => ({
  type: 'UI_CONFIRM_SEQUENCE_METADATA_REPLACED',
  confirmation,
});

export const setSequenceAudioError = error => ({
  type: 'UI_SEQUENCE_AUDIO_ERROR',
  error,
});

export const setSequenceMetadataError = error => ({
  type: 'UI_SEQUENCE_METADATA_ERROR',
  error,
});
