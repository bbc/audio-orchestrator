/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/// Top level, can be home (list of projects) or project (an open project):
export const PAGE_HOME = 'home';
export const PAGE_PROJECT = 'project';

// Second level, one of the pages within the PAGE_PROJECT (requires a currentProjectId to be set):
export const PAGE_PROJECT_SEQUENCES = 'sequences';
export const PAGE_PROJECT_CONTROLS = 'controls';
export const PAGE_PROJECT_OBJECTS = 'objects';
export const PAGE_PROJECT_MONITORING = 'monitoring';
export const PAGE_PROJECT_PRESENTATION = 'presentation';
export const PAGE_PROJECT_EXPORT = 'export';

// Initial state, home page without an open project or sequence opened.
const initialState = {
  currentPage: PAGE_HOME,
  currentProjectId: null,
  currentProjectPage: PAGE_PROJECT_SEQUENCES,
  currentSequenceId: null,
  tasks: {},
  sequenceAudioConfirmation: null,
  sequenceAudioError: null,
  error: null,
  errorLink: null,
  warning: null,
  warningLink: null,
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
        currentProjectPage: PAGE_PROJECT_OBJECTS,
        currentProjectId: action.projectId,
        currentSequenceId: action.sequenceId,
        sequenceAudioConfirmation: null,
        sequenceAudioError: null,
      };
    case 'UI_OPEN_MONITORING_PAGE':
      return {
        ...state,
        currentPage: PAGE_PROJECT,
        currentProjectPage: PAGE_PROJECT_MONITORING,
        currentProjectId: action.projectId,
        currentSequenceId: action.sequenceId,
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
    case 'UI_SET_ERROR':
      return {
        ...state,
        error: action.error,
        errorLink: action.link,
      };
    case 'UI_SET_WARNING':
      return {
        ...state,
        warning: action.warning,
        warningLink: action.link,
      };
    case 'UI_CLEAR_WARNING':
      return {
        ...state,
        warning: action.warning,
      };
    default:
      return state;
  }
};

export default UIReducer;
