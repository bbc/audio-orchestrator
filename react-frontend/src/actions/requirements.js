import RequirementsService from '../lib/RequirementsService';
import {
  setAppError,
} from './ui';

const requirementsService = new RequirementsService(window.API_URL || 'http://localhost:8000');

/* eslint-disable-next-line import/prefer-default-export */
export const requestCheckRequirements = () => (dispatch) => {
  requirementsService.checkRequirements({
    onError: (e) => {
      console.error('requirements error', e);
      dispatch(setAppError('Failed to check for system requirements.'));
    },
    onComplete: ({ result }) => {
      if (!result.success) {
        const errors = result.results.filter(r => r.error).map(r => r.error);
        console.log('requirements complete, but unsuccessful', result);
        // TODO make this a richer error message (not using setAppError)?
        dispatch(setAppError(`The required audio encoding and analysis tools (ffmpeg and ffprobe) were not found in the default locations (/usr/bin, /usr/local/bin). They are most easily installed by using Homebrew (run brew install ffmpeg in Terminal). [Details: ${errors.join(' ')}]`));
      }
    },
  });
};
