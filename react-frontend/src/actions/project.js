import uuidv4 from 'uuid/v4';
import LocalProjectStore from '../lib/LocalProjectStore';
import Project from '../lib/Project';
import FileService from '../lib/FileService';
import {
  setTaskProgress,
  openProjectPage,
  closeProjectPage,
  confirmSequenceAudioReplaced,
  confirmSequenceMetadataReplaced,
  setSequenceAudioError,
  setSequenceMetadataError,
  setAppWarning,
  setAppError,
} from './ui';

// Project store is the interface to the persistent project data accessed by projectId.
const ProjectStore = window.ProjectStore || LocalProjectStore;
const fileService = new FileService(window.API_URL || 'http://localhost:8000');

// The projects object is local to this file and stores references to each project store opened in
// this session as a convenient way to access the project by id.
const projects = {};

/**
 * Action creator, closes the project view.
 */
export const closeProject = (projectId = null) => (dispatch) => {
  dispatch(closeProjectPage());
  if (projectId) {
    dispatch({ type: 'SET_PROJECT_LOADING', projectId, loading: false });
  }
};

/**
 * Action creator, requests a listing of all available projects from the store.
 */
export const requestListProjects = () => (dispatch) => {
  dispatch({ type: 'PROJECT_PROJECTS_LIST_LOADING' });

  ProjectStore.listProjects()
    .then((projectsList) => {
      dispatch({
        type: 'PROJECT_RECEIVED_PROJECTS_LIST',
        projectsList,
      });
    })
    .catch(() => {
      dispatch({ type: 'PROJECT_PROJECTS_LIST_FAILED' });
    });
};

/**
 * Internal action, updates the user interface with the list of files for the sequence.
 */
const loadSequenceFiles = (projectId, sequenceId) => {
  // TODO apply the same filtering here as in setFileProperties (e.g. remove path, items results)
  // ^^ this currently happens in reducer.
  const { filesList, files } = projects[projectId].sequences[sequenceId];

  return {
    type: 'SET_PROJECT_SEQUENCE_FILES',
    projectId,
    sequenceId,
    filesList,
    files,
  };
};

/**
 * Internal action, updates the user interface with the list of objects for the sequence.
 */
const loadSequenceObjects = (projectId, sequenceId) => {
  const { objectsList, objects } = projects[projectId].sequences[sequenceId];

  return {
    type: 'SET_PROJECT_SEQUENCE_OBJECTS',
    projectId,
    sequenceId,
    objectsList,
    objects,
  };
};

const loadSequenceSettings = (projectId, sequenceId) => {
  const { sequences } = projects[projectId];
  const { settings } = sequences[sequenceId];

  return {
    type: 'SET_PROJECT_SEQUENCE_INFO',
    projectId,
    sequenceId,
    ...settings.getExportData(),
  };
};

/**
 * Internal action, updates the UI with all sequence information for the project.
 */
const loadSequences = projectId => (dispatch) => {
  const { sequencesList } = projects[projectId];

  sequencesList.forEach(({
    sequenceId,
  }) => {
    dispatch(loadSequenceSettings(projectId, sequenceId));
    dispatch(loadSequenceFiles(projectId, sequenceId));
    dispatch(loadSequenceObjects(projectId, sequenceId));
  });

  dispatch({ type: 'SET_PROJECT_SEQUENCES_LIST', projectId, sequencesList });
};

export const validateProject = projectId => ({
  type: 'SET_PROJECT_REVIEW_ITEMS',
  projectId,
  reviewItems: projects[projectId].validate(),
});

/**
 * Action creator, populates the state with info from the opened project and updates the UI.
 *
 * For use by other actions in this file only so not exported.
 */
const openedProject = projectId => (dispatch) => {
  const { name, settings } = projects[projectId];

  // Set the project name for use in UI
  dispatch({ type: 'SET_PROJECT_NAME', projectId, name });

  // Set the project settings for use in UI
  dispatch({ type: 'SET_PROJECT_SETTINGS', projectId, settings });

  // Get the sequences for the UI
  dispatch(loadSequences(projectId));

  // Move onto the project page
  dispatch(openProjectPage(projectId));

  // Hide the loading indicator
  dispatch({ type: 'SET_PROJECT_LOADING', projectId, loading: false });

  // TODO do this pretty much anywhere the project is updated
  dispatch(validateProject(projectId));
};

/**
 * Internal action creator, sets properties on a specified file in project store and local state.
 */
export const setFileProperties = (projectId, sequenceId, files) => (dispatch) => {
  // update the interface state
  dispatch({
    type: 'SET_PROJECT_SEQUENCE_FILE_PROPERTIES',
    projectId,
    sequenceId,
    files,
  });

  // update the project store
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];

  const updatedFiles = {
    ...sequence.files,
  };

  files.forEach((update) => {
    // merge the previous file info with the updated fields, but always remove the fileId property.
    const updatedFile = {
      ...updatedFiles[update.fileId],
      ...update,
    };
    delete updatedFile.fileId;

    updatedFiles[update.fileId] = updatedFile;
  });

  sequence.files = updatedFiles;

  dispatch(validateProject(projectId));
};

const setFilesLoading = (projectId, sequenceId, loading, taskId) => ({
  type: 'SET_PROJECT_SEQUENCE_FILES_LOADING',
  projectId,
  sequenceId,
  loading,
  taskId,
});

const setProbeTaskId = (projectId, sequenceId, taskId) => ({
  type: 'SET_PROJECT_SEQUENCE_PROBE_TASK',
  projectId,
  sequenceId,
  taskId,
});

const setItemsTaskId = (projectId, sequenceId, taskId) => ({
  type: 'SET_PROJECT_SEQUENCE_ITEMS_TASK',
  projectId,
  sequenceId,
  taskId,
});

const setEncodeTaskId = (projectId, sequenceId, taskId) => ({
  type: 'SET_PROJECT_SEQUENCE_ENCODE_TASK',
  projectId,
  sequenceId,
  taskId,
});

/**
 * Wraps a call to a batch task creator, and registers the required callbacks.
 *
 * * onProgress: dispatches a task progress action with the number of tasks completed.
 * * onComplete: resolves the promise with the results when they are available.
 * * onError: rejects the promise
 *
 * The results are an array of objects containing at least a fileId and a success flag.
 *
 * @returns {Promise<Array<Object>>}
 */
const createTaskWithProgress = (dispatch, task, taskId, argument) => {
  // ensure the task is created in the state.
  dispatch(setTaskProgress(taskId, 0, argument.length || 0));

  // return a promise that resolves when the task has been completed and results are available.
  return new Promise((resolve, reject) => {
    task(argument, {
      onProgress: ({ completed, total }) => {
        dispatch(setTaskProgress(taskId, completed, total));
      },
      onComplete: ({ results }) => {
        resolve(results);
      },
      onError: () => {
        reject();
      },
    })
      .catch((e) => {
        reject(e);
      });
  });
};

/**
 * Internal action creator, checks files still exist and triggers all missing analysis steps for
 * all files referenced by the sequence.
 */
export const analyseAllFiles = (projectId, sequenceId) => (dispatch) => {
  const project = projects[projectId];
  const { settings } = project;
  const { baseUrl } = settings;
  const sequence = project.sequences[sequenceId];
  const { filesList, files } = sequence;

  const createTaskId = uuidv4();
  const probeTaskId = uuidv4();
  const itemsTaskId = uuidv4();
  const encodeTaskId = uuidv4();

  dispatch(setTaskProgress(createTaskId, 0, 0));
  dispatch(setFilesLoading(projectId, sequenceId, true, createTaskId));

  // load current info from store into state
  dispatch(loadSequenceFiles(projectId, sequenceId));

  // bind file service methods to pass into task creator
  const createAll = fileService.createAll.bind(fileService);
  const probeAll = fileService.probeAll.bind(fileService);
  const itemsAll = fileService.itemsAll.bind(fileService);
  const encodeAll = fileService.encodeAll.bind(fileService);

  // Register the fileIds and paths with the server
  createTaskWithProgress(
    dispatch,
    createAll,
    createTaskId,
    filesList.map(({ fileId }) => {
      const { path } = files[fileId] || {};
      return { fileId, path };
    }),
  )
    .then((results) => {
      // update error messages based on results
      dispatch(setFileProperties(
        projectId, sequenceId,
        results.map(({ success, fileId }) => ({
          fileId,
          error: success ? null : 'File is missing.',
        })),
      ));

      // Hide loader, display file list with pending probe/items results.
      dispatch(setFilesLoading(projectId, sequenceId, false, createTaskId));

      // Pass on a list of fileIds for the existing files (marked as successful in results).
      return results
        .filter(({ success }) => success)
        .map(({ fileId }) => fileId);
    })
    .then((existingFileIds) => {
      // Trigger the probe analysis for every existing file. As this is fast, it is done even if not
      // all files were successful, so that the interface can be updated with the file stats.
      dispatch(setProbeTaskId(projectId, sequenceId, probeTaskId));
      return createTaskWithProgress(dispatch, probeAll, probeTaskId, existingFileIds);
    })
    .then((probeResults) => {
      // update error messages and probe information
      // Augment probe results with error message and unset success flag if additional tests fail.
      const firstProbe = (probeResults[0] || {}).probe;
      const augmentedProbeResults = probeResults.map((result) => {
        const { probe, success } = result;

        let error = success ? null : 'Analysis failed, file may not contain an audio stream.';

        // if the probe worked, compare against the first file duration and required sampleRate.
        if (success && !error && firstProbe) {
          if (probe.duration !== firstProbe.duration) {
            error = 'All audio files must have the same duration.';
          } else if (probe.sampleRate !== 48000) {
            error = 'All audio files must have the project sample rate (48000 Hz).';
          }
        }

        return ({
          ...result,
          error,
          success: error ? false : success,
        });
      });

      dispatch(setFileProperties(
        projectId, sequenceId,
        augmentedProbeResults.map(({
          success,
          fileId,
          probe,
          error,
        }) => ({
          fileId,
          error,
          probe: success ? probe : null,
        })),
      ));

      // Pass on a list of successfully probed fileIds
      return augmentedProbeResults
        .filter(({ success }) => success)
        .map(({ fileId }) => fileId);
    })
    .then((probedFileIds) => {
      // If not all files were probed, cancel the rest of the chain (no need to analyse further).
      // TODO: Check if previous analysis results can be re-used to avoid re-running the analysis.
      if (probedFileIds.length !== filesList.length) {
        return [];
      }

      // Otherwise, start the items analysis for all files that didn't already have results.
      // Then merge the new results with the old results to return a complete list.
      const previousItemsResults = [];
      const fileIdsWithoutItems = [];

      filesList.forEach(({ fileId }) => {
        if ((fileId in files) && !!files[fileId].items) {
          previousItemsResults.push({
            fileId,
            success: true,
            items: files[fileId].items,
          });
        } else {
          fileIdsWithoutItems.push(fileId);
        }
      });

      dispatch(setItemsTaskId(projectId, sequenceId, itemsTaskId));
      return createTaskWithProgress(dispatch, itemsAll, itemsTaskId, fileIdsWithoutItems)
        .then(itemsResults => [
          ...itemsResults,
          ...previousItemsResults,
        ]);
    })
    .then((itemsResults) => {
      // Update error messages and items information.
      dispatch(setFileProperties(
        projectId, sequenceId,
        itemsResults.map(({ success, fileId, items }) => ({
          fileId,
          error: success ? null : 'Analysis failed, file may not be readable by items analysis script.',
          items: success ? items : null,
        })),
      ));

      // Pass on a list of successfully analysed files, and the results for them.
      return itemsResults
        .filter(({ success }) => success)
        .map(({ fileId, items }) => ({ fileId, items }));
    })
    .then((completeFiles) => {
      // If items analysis failed for some files, there is no point in encoding any of them.
      if (completeFiles.length !== filesList.length) {
        return [];
      }

      // Split the completeFiles list into those that do and those that do not have their
      // encodedItemsBasePath set - if they already have it, they do not need to be encoded again.
      const previouslyEncodedFiles = completeFiles
        .filter(({ fileId }) => !!files[fileId].encodedItemsBasePath)
        .map(file => ({
          ...file,
          encodedItemsBasePath: files[file.fileId].encodedItemsBasePath,
          encodedItems: files[file.fileId].encodedItems,
        }));
      const filesToEncode = completeFiles
        .filter(({ fileId }) => !files[fileId].encodedItemsBasePath)
        .map(file => ({ ...file, sequenceId }));

      // Trigger encoding of all files, too, and pass on the results merged with previously encoded
      // files.
      dispatch(setEncodeTaskId(projectId, sequenceId, encodeTaskId));
      return createTaskWithProgress(dispatch, encodeAll, encodeTaskId, { files: filesToEncode, baseUrl })
        .then(encodeResults => [
          ...previouslyEncodedFiles.map(file => ({ ...file, success: true })),
          ...encodeResults,
        ]);
    })
    .then((encodeResults) => {
      // store the results in project store
      // TODO: this should not be a dispatch as state does not need to be updated
      dispatch(setFileProperties(
        projectId, sequenceId,
        encodeResults.map(({
          success,
          fileId,
          encodedItemsBasePath,
          encodedItems,
        }) => ({
          fileId,
          error: success ? null : 'Encoding failed.',
          encodedItemsBasePath: success ? encodedItemsBasePath : null,
          encodedItems: success ? encodedItems : null,
        })),
      ));
    })
    .catch((e) => {
      console.error(e);
      dispatch(setAppError('Failed to analyse files. The analysis service might be unavailable.'));
    });
};

/**
 * Action creator, opens a specified project from the store (or triggers a file-open dialogue).
 */
export const requestOpenProject = (projectId = null) => (dispatch) => {
  dispatch({ type: 'SET_PROJECT_LOADING', projectId, loading: true });

  ProjectStore.openProject(projectId)
    .then((store) => {
      projects[projectId] = new Project(store);
    })
    .then(() => {
      projects[projectId].sequencesList.forEach(({ sequenceId }) => {
        // trigger background analysis for all files in any of the sequences in the opened project.
        dispatch(analyseAllFiles(projectId, sequenceId));

        // load the object metadata
        dispatch(loadSequenceObjects(projectId, sequenceId));
      });
    })
    .then(() => {
      dispatch(openedProject(projectId));
    })
    .catch((e) => {
      console.error(e);
      setAppWarning('The project could not be opened.');
      dispatch(closeProject());
    });
};

/**
 * Action creator, creates a new project in the store (or triggers a file-save dialogue) and opens
 * it.
 */
export const requestCreateProject = () => (dispatch) => {
  ProjectStore.createProject()
    .then(({ projectId, store }) => {
      // create the project
      const project = new Project(store);
      projects[projectId] = project;

      // create the standard sequences
      const introSequence = project.addSequence({ name: 'Initial Sequence', isIntro: true });

      // link the standard sequences together:
      // the intro points to the main sequence, and can be skipped; and
      // the main sequence links back to itself, holds at the end, and cannot be skipped.
      introSequence.settings.next = [
        {
          sequenceId: introSequence.sequenceId,
          label: 'Listen Again',
        },
      ];

      dispatch(openedProject(projectId));
    })
    .catch((e) => {
      console.error(e);
      setAppWarning('The project could not be created.');
      dispatch(closeProject());
    });
};

/**
 * Action creator, adds a sequence to the project and reloads the sequence data.
 */
export const requestAddSequence = projectId => (dispatch) => {
  const project = projects[projectId];
  project.addSequence();
  dispatch(loadSequences(projectId));
  dispatch(validateProject(projectId));
};

/**
 * Action creator, adds a sequence to the project and reloads the sequence data.
 */
export const requestDeleteSequence = (projectId, sequenceId) => (dispatch) => {
  const project = projects[projectId];
  project.deleteSequence(sequenceId);
  dispatch(loadSequences(projectId));
  dispatch(validateProject(projectId));
};

/**
 * Delete the project from the state.
 */
const deleteProject = projectId => ({
  type: 'PROJECT_DELETE_PROJECT',
  projectId,
});

/**
 * Action creator, deletes a project.
 */
export const requestDeleteProject = projectId => (dispatch) => {
  // Have to open the project first to create the Project object, because this action is triggered
  // from outside the project page.
  ProjectStore.openProject(projectId)
    .then((store) => {
      const project = new Project(store);
      project.delete();
    })
    .then(() => {
      delete projects[projectId];
      ProjectStore.deleteProject(projectId);
    })
    .then(() => {
      dispatch(deleteProject());
      dispatch(closeProjectPage());
      dispatch(requestListProjects());
    });
};

/**
 * Action creator, updates the state with whether the backing store supports opening unlisted
 * projects (using a native file-open dialogue).
 */
export const checkFileOpen = () => (dispatch) => {
  dispatch({
    type: 'PROJECT_ALLOW_FILE_OPEN',
    allowFileOpen: ProjectStore.canOpenUnlisted(),
  });
};

/**
 * Action creator, sets the current project's name.
 */
export const setProjectName = (projectId, name) => (dispatch) => {
  const project = projects[projectId];
  project.name = name;
  dispatch({ type: 'SET_PROJECT_NAME', projectId, name });
};

/**
 * Action creator, changes a single value in the project's settings.
 */
export const setProjectSetting = (projectId, key, value) => (dispatch) => {
  const project = projects[projectId];
  const newSettings = { ...project.settings, [key]: value };
  project.settings = newSettings;

  dispatch({ type: 'SET_PROJECT_SETTINGS', projectId, settings: newSettings });

  dispatch(validateProject(projectId));
};

/**
 * Action creator, changes a single value in a sequence's settings.
 */
export const setSequenceSetting = (projectId, sequenceId, key, value) => (dispatch) => {
  const { sequences } = projects[projectId];
  const { settings } = sequences[sequenceId];

  settings[key] = value;

  dispatch(loadSequences(projectId));
  dispatch(validateProject(projectId));
};

const fileNameToObjectNumber = name => parseInt(name, 10) || null;

/**
 * Attempt to link objects to files. Update project store with results.
 */
const matchObjectsToFiles = (projectId, sequenceId) => {
  // load required data from project store
  const project = projects[projectId];
  const { zones } = project.settings;
  const sequence = project.sequences[sequenceId];

  const suffixToChannelMapping = {
    _L: 'left',
    _R: 'right',
    _M: 'mono',
    _C: 'mono',
  };

  const suffixToPanning = {
    _L: 30,
    _R: -30,
    _M: 0,
    _C: 0,
  };

  // The default orchestration metadata for a new object
  const defaultOrchestration = {
    mdoOnly: 0,
    mdoSpread: 0,
    exclusivity: 0,
    mdoThreshold: 0,
    muteIfObject: 0,
    onDropin: 0,
    onDropout: 0,
    image: null,
  };

  (zones || []).forEach(({ name }) => {
    defaultOrchestration[name] = 1;
  });

  const newObjects = { ...sequence.objects };

  // select or create objects for all files.
  (sequence.filesList || []).forEach(({ fileId, name }) => {
    // do not create dummy objects for files that don't match the naming convention (TODO: error?)
    const objectNumber = fileNameToObjectNumber(name);
    if (objectNumber === null) {
      console.warn(`${name} does not match naming convention, should start with a number`);
      return;
    }

    // Create a label from the section of the file name between object number and extension
    const baseName = name.slice(0, name.lastIndexOf('.'));
    const label = baseName.replace(/^[0-9]*[_-\s]*/, '');
    const suffix = baseName.slice(-2);

    const oldObject = sequence.objects[objectNumber];
    if (!oldObject) {
      // Create an object with the default metadata
      newObjects[objectNumber] = {
        objectNumber,
        label,
        orchestration: { ...defaultOrchestration },
        fileId,
        panning: suffixToPanning[suffix] || 0,
        channelMapping: suffixToChannelMapping[suffix] || 'mono',
      };
    } else {
      // Merge the object with the defaults, to ensure there are values for all fields.
      // overwrite the label and fileId because these are always based on the file.
      newObjects[objectNumber] = {
        ...newObjects[objectNumber],
        label,
        fileId,
        orchestration: {
          ...defaultOrchestration,
          ...newObjects[objectNumber].orchestration,
        },
      };
    }
  });

  // update project with modified objects
  sequence.objects = newObjects;
  sequence.objectsList = Object.keys(newObjects).map(objectNumber => ({
    objectNumber: Number(objectNumber),
    label: newObjects[objectNumber].label,
  }));

  // go through all objects, and remove fileId from objects where not present any more.
  (sequence.objectsList || []).forEach(({ objectNumber }) => {
    // remove fileId from objects where the file doesn't exist anymore
    const object = sequence.objects[objectNumber];
    const { fileId } = object;

    sequence.objects = {
      ...sequence.objects,
      [objectNumber]: {
        panning: 0,
        channelMapping: 'mono',
        ...object,
        orchestration: {
          ...defaultOrchestration,
          ...object.orchestration,
        },
        fileId: (fileId in sequence.files) ? fileId : null,
      },
    };
  });
};

/**
 * Replace all file information in the sequence with the supplied list of file objects expected to
 * contain { name, path, fileId }.
 */
const initialiseSequenceFiles = (projectId, sequenceId, newFiles) => (dispatch) => {
  // assign a unique ID to each file
  const filesWithIds = newFiles.map(file => ({ ...file, fileId: uuidv4() }));

  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];

  // create a file object, initially only containing the path and name, to store more detailed info
  // about each file.
  const files = {};
  filesWithIds.forEach(({ fileId, path, name }) => {
    files[fileId] = { path, name };
  });

  // create a list of { fileId, name }, sorted by ascending name for use as an index.
  const filesList = filesWithIds
    .map(({ fileId, name }) => ({ fileId, name }))
    .sort((a, b) => {
      const A = a.name.toUpperCase();
      const B = b.name.toUpperCase();
      if (A < B) return -1;
      if (A > B) return 1;
      return 0;
    });

  // store both in project
  sequence.files = files;
  sequence.filesList = filesList;

  // attempt to link objects to these new files; or create placeholder objects.
  matchObjectsToFiles(projectId, sequenceId);

  // update the interface state to match what was just stored
  dispatch(loadSequenceFiles(projectId, sequenceId));
  dispatch(loadSequenceObjects(projectId, sequenceId));

  // trigger analysis of the new files and update the UI, also updating files in store and state.
  dispatch(analyseAllFiles(projectId, sequenceId));

  // TODO: dispatch(confirmAudioFilesReplaced(projectId, sequenceId));
};

/**
 * Action creator, opens a file-open dialogue and then replaces the sequence's audio files with
 * those selected.
 */
export const requestReplaceAllAudioFiles = (projectId, sequenceId) => (dispatch) => {
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/wav';
    input.multiple = true;
    input.style.display = 'none';

    const onChange = () => {
      const { files } = input;
      input.removeEventListener('change', onChange);
      document.body.removeChild(input);
      if (files.length > 0) {
        resolve(files);
      } else {
        reject(new Error('No files selected'));
      }
    };

    input.addEventListener('change', onChange);

    document.body.appendChild(input);
    input.click();
  }).then((fileList) => {
    const files = [];

    // Take the FileList and reduce it to a plain array of file names and paths only.
    // In electron, the path is populated with the absolute path to the file. In the browser, path
    // will be undefined. In that case, a file upload to a server may need to be triggered.
    for (let i = 0; i < fileList.length; i += 1) {
      const file = fileList[i];
      files.push({
        name: file.name,
        path: file.path,
      });
    }

    return files;
  }).then((files) => {
    dispatch(initialiseSequenceFiles(projectId, sequenceId, files));
    dispatch(confirmSequenceAudioReplaced('New audio files linked.'));
    dispatch(validateProject(projectId));
  }).catch((e) => {
    console.error(e);
    dispatch(setSequenceAudioError('No valid files selected.'));
  });
};

const parseCsvMetadata = (contents) => {
  const [keys, ...objectRows] = contents.split('\n').map(line => line.split(',').map(cell => cell.trim()));

  const mdoObjects = objectRows.map((row) => {
    const obj = {};
    keys.forEach((key, i) => {
      obj[key] = row[i];
    });
    return obj;
  });

  return { mdoObjects };
};

/**
 * Utility; parse a file contents string or buffer as a JSON object and extract the metadata
 * objects list.
 *
 * @returns {Promise<Array<Object>>>}
 */
const parseMetadataFile = file => new Promise((resolve, reject) => {
  // create a file reader to get the contents of the selected file, and register events on it.
  const reader = new FileReader();
  reader.addEventListener('error', () => {
    reject(new Error('Could not read metadata file.'));
  });
  reader.addEventListener('loadend', () => {
    let metadata;
    if (reader.result.startsWith('{')) {
      metadata = JSON.parse(reader.result);
    } else {
      metadata = parseCsvMetadata(reader.result);
    }
    const objects = metadata.mdoObjects || [];
    resolve(objects.map(object => ({
      // backwards compatibility, CSV format specified in bbcat-orchestration used mdoObjectLabel
      ...object,
      label: object.label || object.mdoObjectLabel,
    })));
  });

  // start reading the file, will trigger the error or loadend event when finished.
  reader.readAsText(file);
}).then((objects) => {
  // ensure objects is valid
  if (!Array.isArray(objects) || objects.length === 0) {
    throw new Error('Could not parse metadata file, format may be invalid or it may not contain any objects.');
  }
  if (!objects.every(object => ('objectNumber' in object && 'label' in object))) {
    throw new Error('Not every object has a number and label.');
  }

  // parse all orchestration metadata fields as integers (except the label and image column)
  return objects.map((object) => {
    const parsedObject = { ...object };

    Object.keys(object).forEach((key) => {
      if (key !== 'label' && key !== 'image') { // TODO better sanitization of metadata object
        parsedObject[key] = parseInt(object[key], 10) || 0;
      }
    });
    return parsedObject;
  });
});

/**
 * Action; replaces the objects associated with the given sequence, updates the project store, and
 * dispatches an update to the UI state.
 *
 * @param {Array<Object>} rawObjects - containing the objects parsed from JSON only.
 */
const initialiseSequenceObjects = (projectId, sequenceId, rawObjects) => (dispatch) => {
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];

  const newObjects = {};
  const newObjectsList = rawObjects.map(({ objectNumber, label }) => ({
    objectNumber: parseInt(objectNumber, 10),
    label,
  }));

  rawObjects.forEach((data) => {
    const objectNumber = parseInt(data.objectNumber, 10);

    newObjects[objectNumber] = ({
      objectNumber,
      label: '',
      fileId: null,
      orchestration: {
        ...data, // TODO: filter to required columns only?
        image: data.image || null,
      },
    });
  });

  // store results in project store
  sequence.objectsList = newObjectsList;
  sequence.objects = newObjects;

  // Update store with new object-file mappings
  matchObjectsToFiles(projectId, sequenceId);

  // load objects into state.
  dispatch(loadSequenceObjects(projectId, sequenceId));
  dispatch(validateProject(projectId));
};

export const resetObjectMetadata = (projectId, sequenceId, objectNumber) => (dispatch) => {
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];

  // replace the object with an empty object, so it can be filled in based on the file name.
  sequence.objects = {
    ...sequence.objects,
    [objectNumber]: { objectNumber },
  };

  matchObjectsToFiles(projectId, sequenceId);

  dispatch(loadSequenceObjects(projectId, sequenceId));
};

export const deleteObject = (projectId, sequenceId, objectNumber) => (dispatch) => {
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];

  // remove file entry from sequence files and file list
  const { fileId } = sequence.objects[objectNumber];
  if (fileId in sequence.files) {
    const newFiles = { ...sequence.files };
    delete newFiles[fileId];
    sequence.files = newFiles;
    sequence.filesList = sequence.filesList.filter(f => f.fileId !== fileId);
  }

  // remove object from sequence objects, and objects list.
  const newObjects = { ...sequence.objects };
  delete newObjects[objectNumber];
  sequence.objects = newObjects;
  sequence.objectsList = sequence.objectsList.filter(o => o.objectNumber !== objectNumber);

  // ensure objects and files are still consistent, and reload both.
  matchObjectsToFiles(projectId, sequenceId);
  dispatch(loadSequenceFiles(projectId, sequenceId));
  dispatch(loadSequenceObjects(projectId, sequenceId));
};

export const setObjectOrchestrationFields = (
  projectId, sequenceId, objectNumber, fields,
) => (dispatch) => {
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];

  const object = sequence.objects[objectNumber];
  const newObject = {
    ...object,
    orchestration: {
      ...object.orchestration,
      ...fields,
    },
  };

  sequence.objects = {
    ...sequence.objects,
    [objectNumber]: newObject,
  };

  dispatch(loadSequenceObjects(projectId, sequenceId));
};

export const setObjectPanning = (
  projectId, sequenceId, objectNumber, channelMapping,
) => (dispatch) => {
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];

  const channelMappingToPanning = {
    left: 30,
    mono: 0,
    right: -30,
  };

  const object = sequence.objects[objectNumber];
  const newObject = {
    ...object,
    channelMapping: channelMapping,
    panning: channelMappingToPanning[channelMapping],
  };

  sequence.objects = {
    ...sequence.objects,
    [objectNumber]: newObject,
  };

  dispatch(loadSequenceObjects(projectId, sequenceId));
};
/**
 * Replace metadata file, open a file-open dialogue and replace the object metadata if a valid file
 * is selected.
 */
export const requestReplaceMetadata = (projectId, sequenceId) => (dispatch) => {
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json, .txt, .csv';
    input.multiple = false;
    input.style.display = 'none';

    const onChange = () => {
      const { files } = input;
      input.removeEventListener('change', onChange);
      document.body.removeChild(input);
      if (files.length > 0) {
        resolve(files);
      } else {
        reject(new Error('No file selected'));
      }
    };

    input.addEventListener('change', onChange);

    document.body.appendChild(input);
    input.click();
  }).then((fileList) => {
    const file = fileList[0];
    return parseMetadataFile(file);
  }).then((objects) => {
    dispatch(initialiseSequenceObjects(projectId, sequenceId, objects));
    dispatch(confirmSequenceMetadataReplaced('New metadata loaded.'));
    dispatch(validateProject(projectId));
  }).catch((e) => {
    dispatch(setSequenceMetadataError('No file selected or invalid format.'));
    dispatch(validateProject(projectId));
    console.error(e);
  });
};

export const addZone = (projectId, name) => (dispatch) => {
  const project = projects[projectId];
  const { sequencesList, sequences, settings } = project;
  const zones = settings.zones || [];

  if (!name) {
    dispatch(setAppWarning('The tag name cannot be empty. Please enter a name.'));
    return;
  }

  if (zones.some(z => z.name === name)) {
    dispatch(setAppWarning(`The tag '${name}' already exists. Tag names have to be unique.`));
    return;
  }

  dispatch(setProjectSetting(
    projectId,
    'zones',
    [
      ...zones,
      {
        zoneId: uuidv4(),
        name,
        friendlyName: name,
      },
    ],
  ));

  // For all objects in all sequences, if they hadn't had the zone set already, set it to 'never'.
  sequencesList.forEach(({ sequenceId }) => {
    const sequence = sequences[sequenceId];

    const { objectsList, objects } = sequence;
    const newObjects = {};

    objectsList.forEach(({ objectNumber }) => {
      const { orchestration, ...rest } = objects[objectNumber];

      newObjects[objectNumber] = {
        orchestration: {
          ...orchestration,
          [name]: orchestration[name] || 1,
        },
        ...rest,
      };
    });

    sequence.objects = newObjects;
    dispatch(loadSequenceObjects(projectId, sequenceId));
  });
};

export const renameZone = (projectId, renameZoneId, friendlyName) => (dispatch) => {
  const project = projects[projectId];
  const { zones } = project.settings;

  dispatch(setProjectSetting(
    projectId,
    'zones',
    zones.map((z) => {
      if (z.zoneId === renameZoneId) {
        return {
          ...z,
          friendlyName,
        };
      }
      return z;
    }),
  ));
};

export const deleteZone = (projectId, deleteZoneId) => (dispatch) => {
  const project = projects[projectId];
  const { zones } = project.settings;

  dispatch(setProjectSetting(
    projectId,
    'zones',
    zones.filter(({ zoneId }) => zoneId !== deleteZoneId),
  ));
};
