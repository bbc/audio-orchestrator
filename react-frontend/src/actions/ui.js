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
*/

import {
  PAGE_PROJECT_SEQUENCES,
} from '../reducers/UIReducer.js';

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

export const openMonitoringPage = (projectId, sequenceId) => ({
  type: 'UI_OPEN_MONITORING_PAGE',
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

export const confirmSequenceAudioReplaced = (confirmation) => ({
  type: 'UI_CONFIRM_SEQUENCE_AUDIO_REPLACED',
  confirmation,
});

export const setSequenceAudioError = (error) => ({
  type: 'UI_SEQUENCE_AUDIO_ERROR',
  error,
});

export const setAppError = (error, link = null) => ({
  type: 'UI_SET_ERROR',
  error,
  link,
});

export const setAppWarning = (warning, link = null) => ({
  type: 'UI_SET_WARNING',
  warning,
  link,
});

export const clearAppWarning = () => ({
  type: 'UI_CLEAR_WARNING',
});
