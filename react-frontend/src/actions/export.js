import ExportService from '../lib/ExportService';
import LocalProjectStore from '../lib/LocalProjectStore';
import { setFileProperties, analyseAllFiles } from './project';

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
  console.log('request cancel');
  // TODO cancel export task on server and stop polling it.
  // close the export status overlay
  cancelExports();
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

const getSequencesToExport = (project) => {
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
    .map(({ sequenceId, isIntro, isMain }) => {
      const objectsList = project.get(`sequences.${sequenceId}.objectsList`, []);
      const objects = project.get(`sequences.${sequenceId}.objects`, {});
      const files = project.get(`sequences.${sequenceId}.files`, {});
      const loop = !!isIntro; // only the intro sequence is looped

      return {
        sequenceId,
        isMain,
        isIntro,
        files,
        objects: objectsList.map(({ objectNumber }) => objects[objectNumber]),
        loop,
      };
    });
};

const encodeMissingItems = (projectId, missingFiles) => (dispatch) => {
  // remove encodeItems from projectStore for files affected
  const missingBySequence = {};

  missingFiles.forEach(({ sequenceId, fileId }) => {
    if (!(sequenceId in missingBySequence)) {
      missingBySequence[sequenceId] = [];
    }
    missingBySequence[sequenceId].push(fileId);
  });

  Object.keys(missingBySequence).forEach((sequenceId) => {
    dispatch(setFileProperties(
      projectId,
      sequenceId,
      missingBySequence[sequenceId].map(fileId => ({
        fileId,
        encodedItems: null,
        encodedItemsBasePath: null,
      })),
    ));
    dispatch(analyseAllFiles(projectId, sequenceId));
  });
};

export const requestExportAudio = projectId => (dispatch) => {
  dispatch(startExport('audio'));

  // Get the project information from the store
  // TODO wrap project store opening and accessing properties in a class to avoid duplication.
  // opening by projectId will not work well when the project was originally opened from a file.
  ProjectStore.openProject(projectId)
    .then((project) => {
      const sequences = getSequencesToExport(project);
      return waitForExportTask(dispatch, exportAudio, { sequences });
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
      if (error.missingEncodedItems) {
        dispatch(encodeMissingItems(projectId, error.missingEncodedItems));
      }
      console.error('EXPORT ERROR', error);
    });
};

export const requestExportTemplate = projectId => (dispatch) => {
  dispatch(startExport('template source'));

  ProjectStore.openProject(projectId)
    .then((project) => {
      const sequences = getSequencesToExport(project);
      const settings = project.get('settings');

      return { sequences, settings };
    })
    .then(({ sequences, settings }) => waitForExportTask(
      dispatch,
      exportTemplate,
      { sequences, settings },
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
      if (error.missingEncodedItems) {
        dispatch(encodeMissingItems(projectId, error.missingEncodedItems));
      }
      console.error('EXPORT ERROR', error);
    });
};

export const requestExportDistribution = projectId => (dispatch) => {
  dispatch(startExport('built distribution'));

  ProjectStore.openProject(projectId)
    .then((project) => {
      const sequences = getSequencesToExport(project);
      const settings = project.get('settings');

      return { sequences, settings };
    })
    .then(({ sequences, settings }) => waitForExportTask(
      dispatch,
      exportDistribution,
      { sequences, settings },
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
      if (error.missingEncodedItems) {
        dispatch(encodeMissingItems(projectId, error.missingEncodedItems));
      }
      console.error('EXPORT ERROR', error);
    });
};

export const requestStartPreview = projectId => (dispatch) => {
  dispatch(startExport('preview'));

  ProjectStore.openProject(projectId)
    .then((project) => {
      const sequences = getSequencesToExport(project);
      const settings = project.get('settings');

      return { sequences, settings };
    })
    .then(({ sequences, settings }) => waitForExportTask(
      dispatch,
      startPreview,
      { sequences, settings },
    ))
    .then(({ result }) => {
      // TODO preview-specific handling
      dispatch(completeExport(result.url));
    })
    .catch((error) => {
      dispatch(failExport(error.message));
      if (error.missingEncodedItems) {
        dispatch(encodeMissingItems(projectId, error.missingEncodedItems));
      }
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
