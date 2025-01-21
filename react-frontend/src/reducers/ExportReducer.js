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
