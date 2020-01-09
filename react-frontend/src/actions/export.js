import Project from '../lib/Project';

import ExportService from '../lib/ExportService';
import LocalProjectStore from '../lib/LocalProjectStore';

const ProjectStore = window.ProjectStore || LocalProjectStore;
const exportService = new ExportService(window.API_URL || 'http://localhost:8000');

const exportAudio = exportService.exportAudio.bind(exportService);
const exportTemplate = exportService.exportTemplate.bind(exportService);
const exportDistribution = exportService.exportDistribution.bind(exportService);
const startPreview = exportService.startPreview.bind(exportService);
const cancelExports = exportService.cancelExports.bind(exportService);

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
  // cancel export task on server and stop polling it.
  // close the export status overlay
  cancelExports();
  dispatch(closeExport());
  dispatch(failExport('cancelled'));
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
      onError: (error) => {
        reject(error);
      },
    }).catch((err) => {
      // reject the promise even if there is an error in creating the task, that does not come back
      // through the onError callback.
      reject(err);
    });
  });
};

export const requestExportAudio = projectId => (dispatch) => {
  dispatch(startExport('audio'));

  // Get the project information from the store
  // TODO wrap project store opening and accessing properties in a class to avoid duplication.
  // opening by projectId will not work well when the project was originally opened from a file.
  ProjectStore.openProject(projectId)
    .then((store) => {
      const project = new Project(store);
      const { settings } = project;
      const sequences = project.getSequencesToExport();
      return waitForExportTask(dispatch, exportAudio, { sequences, settings });
    })
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
      dispatch(failExport(error.message));
      console.error('EXPORT ERROR', error);
    });
};

export const requestExportTemplate = projectId => (dispatch) => {
  dispatch(startExport('template source'));

  ProjectStore.openProject(projectId)
    .then((store) => {
      const project = new Project(store);
      const sequences = project.getSequencesToExport();
      const controls = project.getControlsToExport();
      const { settings } = project;

      return { sequences, controls, settings };
    })
    .then(({ sequences, controls, settings }) => waitForExportTask(
      dispatch,
      exportTemplate,
      { sequences, controls, settings },
    ))
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
      dispatch(failExport(error.message));
      console.error('EXPORT ERROR', error);
    });
};

export const requestExportDistribution = projectId => (dispatch) => {
  dispatch(startExport('built distribution'));

  ProjectStore.openProject(projectId)
    .then((store) => {
      const project = new Project(store);
      const sequences = project.getSequencesToExport();
      const controls = project.getControlsToExport();
      const { settings } = project;

      return { sequences, controls, settings };
    })
    .then(({ sequences, controls, settings }) => waitForExportTask(
      dispatch,
      exportDistribution,
      { sequences, controls, settings },
    ))
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
      dispatch(failExport(error.message));
      console.error('EXPORT ERROR', error);
    });
};

export const requestStartPreview = projectId => (dispatch) => {
  dispatch(startExport('preview'));

  ProjectStore.openProject(projectId)
    .then((store) => {
      const project = new Project(store);
      const sequences = project.getSequencesToExport();
      const controls = project.getControlsToExport();
      const { settings } = project;

      return { sequences, controls, settings };
    })
    .then(({ sequences, controls, settings }) => waitForExportTask(
      dispatch,
      startPreview,
      { sequences, controls, settings },
    ))
    .then(({ result }) => {
      // TODO preview-specific handling
      dispatch(completeExport(result.url));
    })
    .catch((error) => {
      dispatch(failExport(error.message));
      console.error('PREVIEW ERROR', error);
    });
};


export const requestOpenInFolder = outputPath => () => {
  if (window.openInFolder) {
    window.openInFolder(outputPath);
  }
};

export const requestOpenUrl = url => () => {
  if (window.openUrl) {
    window.openUrl(url);
  }
};
