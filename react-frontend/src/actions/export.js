import ExportService from '../lib/ExportService';
import LocalProjectStore from '../lib/LocalProjectStore';

const ProjectStore = window.ProjectStore || LocalProjectStore;
const exportService = new ExportService(window.API_URL || 'http://localhost:8000');

const exportAudio = exportService.exportAudio.bind(exportService);

/* --- private basic action creators --- */

const startExport = title => ({
  type: 'EXPORT_START',
  title,
});

const closeExport = () => ({
  type: 'EXPORT_CLOSE',
});

const failExport = error => ({
  type: 'EXPORT_FAIL',
  error,
});

const completeExport = outputPath => ({
  type: 'EXPORT_COMPLETE',
  outputPath,
});

const setExportProgress = (progressPercent, stepTitle) => ({
  type: 'EXPORT_PROGRESS',
  progressPercent,
  stepTitle,
});

/* --- deferred actions and helpers --- */

export const requestCancelExport = () => (dispatch) => {
  console.log('request cancel');
  // TODO cancel export task on server and stop polling it.
  // close the export status overlay
  dispatch(closeExport());
};

/**
 * Wraps a call to a task creator, and registers the required callbacks.
 *
 * * onProgress: dispatches a task progress action with the number of tasks completed.
 * * onComplete: resolves the promise with the results when they are available.
 * * onError: rejects the promise
 *
 * @returns {Promise<Object>}
 */
const waitForExportTask = (dispatch, task, args) => {
  // ensure the task is created in the state.
  dispatch(setExportProgress(0, 'preparing'));

  // return a promise that resolves when the task has been completed and results are available.
  return new Promise((resolve, reject) => {
    task(args, {
      onProgress: ({ completed, total, currentStep }) => {
        dispatch(setExportProgress((100 * completed / total) || 0, currentStep));
      },
      onComplete: ({ result }) => {
        resolve({ result });
      },
      onError: (errorMessage) => {
        reject(new Error(errorMessage));
      },
    });
  });
};

export const requestExportAudio = projectId => (dispatch) => {
  dispatch(startExport('audio'));

  // Get the project information from the store
  // TODO wrap project store opening and accessing properties in a class to avoid duplication.
  // opening by projectId will not work well when the project was originally opened from a file.
  return ProjectStore.openProject(projectId)
    .then((project) => {
      // Create a list of sequences, each with a files object and an objects list
      const sequencesList = project.get('sequencesList', []);
      return sequencesList
        .filter(({ sequenceId, isMain }) => {
          // always include the main sequence - throw an error later if it doesn't have obejcts.
          if (isMain) {
            return true;
          }

          // also include all other sequences that have objects (so have either files or metadata).
          const objectsList = project.get(`sequences.${sequenceId}.objectsList`, []);
          return objectsList.length > 0;
        })
        .map(({ sequenceId, isIntro }) => {
          const objectsList = project.get(`sequences.${sequenceId}.objectsList`, []);
          const objects = project.get(`sequences.${sequenceId}.objects`, {});
          const files = project.get(`sequences.${sequenceId}.files`, {});
          const loop = !!isIntro; // only the intro sequence is looped

          return {
            sequenceId,
            files,
            objects: objectsList.map(({ objectNumber }) => objects[objectNumber]),
            loop,
          };
        });
    })
    .then(sequences => waitForExportTask(dispatch, exportAudio, { sequences }))
    .then(({ result }) => {
      const { outputDir } = result;
      if (window.saveExportAs) {
        return window.saveExportAs(outputDir)
          .catch(() => outputDir); // return original path if it cannot be moved.
      }
      return outputDir;
    })
    .then((outputDir) => {
      dispatch(completeExport(outputDir));
    })
    .catch((error) => {
      dispatch(failExport(`${error}`));
      console.error('EXPORT ERROR', error);
    });
};

export const requestExportTemplate = projectId => (dispatch) => { };

export const requestExportDistribution = projectId => (dispatch) => { };

export const requestOpenInFolder = (outputPath) => () => {
  if (window.openInFolder) {
    window.openInFolder(outputPath);
  }
};
