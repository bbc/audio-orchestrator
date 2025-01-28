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

import RequirementsService from '#Lib/RequirementsService.js';
import {
  setAppError,
} from './ui.js';

const requirementsService = new RequirementsService();

/* eslint-disable-next-line import/prefer-default-export */
export const requestCheckRequirements = () => (dispatch) => {
  requirementsService.checkRequirements({
    onError: (e) => {
      console.error('requirements error', e);
      dispatch(setAppError('Failed to check for system requirements.'));
    },
    onComplete: ({ result }) => {
      if (!result.success) {
        const errors = result.results.filter((r) => r.error).map((r) => r.error);
        console.log('requirements complete, but unsuccessful', result);
        // TODO make this a richer error message (not using setAppError)?
        dispatch(setAppError(
          `The required audio encoding and analysis tools (ffmpeg and ffprobe) were not found in the default locations. See the installation instructions in the documentation for more information and guidance. [Details: ${errors.join(' ')}]`,
          'https://bbc.github.io/audio-orchestrator/error-messages/required-audio-encoding-tools-were-not-found/',
        ));
      }
    },
  });
};
