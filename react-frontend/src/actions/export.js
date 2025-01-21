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

import Project from '#Lib/Project.js';

import ExportService from '#Lib/ExportService.js';
import ProjectStore from '#Lib/IpcProjectStore.js';

const exportService = new ExportService();

const exportAudio = exportService.exportAudio.bind(exportService);
const exportTemplate = exportService.exportTemplate.bind(exportService);
const exportDistribution = exportService.exportDistribution.bind(exportService);
const startPreview = exportService.startPreview.bind(exportService);
const cancelExports = exportService.cancelExports.bind(exportService);

const { exportFunctions } = window;

/* --- private basic action creators --- */

const startExport = (title) => ({
  type: 'EXPORT_START',
  title,
});

const closeExport = () => ({
  type: 'EXPORT_CLOSE',
});

const failExport = (error) => ({
  type: 'EXPORT_FAIL',
  error,
});

const completeExport = (outputPath) => ({
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
  dispatch(setExportProgress(0, 'Preparing...'));

  // return a promise that resolves when the task has been completed and results are available.
  return new Promise((resolve, reject) => {
    task(args, {
      onProgress: ({ completed, total, currentStep }) => {
        dispatch(setExportProgress((100 * (completed / total)) || 0, currentStep));
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

export const requestExportAudio = (projectId) => (dispatch) => {
  dispatch(startExport('audio'));

  // Get the project information from the store
  // TODO wrap project store opening and accessing properties in a class to avoid duplication.
  // opening by projectId will not work well when the project was originally opened from a file.
  ProjectStore.openProject(projectId)
    .then(({ store }) => {
      const project = new Project(store);
      const { settings } = project;
      const sequences = project.getSequencesToExport();
      return waitForExportTask(dispatch, exportAudio, { sequences, settings });
    })
    .then(({ result }) => {
      const { outputDir } = result;
      return exportFunctions.saveExportAs(outputDir)
        .catch(() => outputDir); // return original path if it cannot be moved.
    })
    .then((outputDir) => {
      dispatch(completeExport(outputDir));
    })
    .catch((error) => {
      dispatch(failExport(error.message));
      console.error('EXPORT ERROR', error);
    });
};

export const requestExportTemplate = (projectId) => (dispatch) => {
  dispatch(startExport('template source'));

  ProjectStore.openProject(projectId)
    .then(({ store }) => {
      const project = new Project(store);
      const sequences = project.getSequencesToExport();
      const controls = project.getControlsToExport();
      const { settings, images } = project;

      return {
        sequences,
        controls,
        settings,
        images,
      };
    })
    .then((args) => waitForExportTask(
      dispatch,
      exportTemplate,
      args,
    ))
    .then(({ result }) => {
      const { outputDir } = result;
      return exportFunctions.saveExportAs(outputDir)
        .catch(() => outputDir); // return original path if it cannot be moved.
    })
    .then((outputDir) => {
      dispatch(completeExport(outputDir));
    })
    .catch((error) => {
      dispatch(failExport(error.message));
      console.error('EXPORT ERROR', error);
    });
};

export const requestExportDistribution = (projectId) => (dispatch) => {
  dispatch(startExport('built distribution'));

  ProjectStore.openProject(projectId)
    .then(({ store }) => {
      const project = new Project(store);
      const sequences = project.getSequencesToExport();
      const controls = project.getControlsToExport();
      const { settings, images } = project;

      return {
        sequences,
        controls,
        settings,
        images,
      };
    })
    .then((args) => waitForExportTask(
      dispatch,
      exportDistribution,
      args,
    ))
    .then(({ result }) => {
      const { outputDir } = result;
      return exportFunctions.saveExportAs(outputDir)
        .catch(() => outputDir); // return original path if it cannot be moved.
    })
    .then((outputDir) => {
      dispatch(completeExport(outputDir));
    })
    .catch((error) => {
      dispatch(failExport(error.message));
      console.error('EXPORT ERROR', error);
    });
};

export const requestStartPreview = (projectId) => (dispatch) => {
  dispatch(startExport('preview'));

  ProjectStore.openProject(projectId)
    .then(({ store }) => {
      const project = new Project(store);
      const sequences = project.getSequencesToExport();
      const controls = project.getControlsToExport();
      const { settings, images } = project;

      return {
        sequences,
        controls,
        settings,
        images,
      };
    })
    .then((args) => waitForExportTask(
      dispatch,
      startPreview,
      args,
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

export const requestOpenInFolder = (outputPath) => () => {
  exportFunctions.openInFolder(outputPath);
};
