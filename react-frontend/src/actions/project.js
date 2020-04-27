import uuidv4 from 'uuid/v4';
import LocalProjectStore from '../lib/LocalProjectStore';
import Project from '../lib/Project';
import FileService from '../lib/FileService';
import {
  setTaskProgress,
  openProjectPage,
  closeProjectPage,
  confirmSequenceAudioReplaced,
  setSequenceAudioError,
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
export const closeProject = () => (dispatch) => {
  dispatch(closeProjectPage());
};

/**
 * Action creator, requests a listing of all available projects from the store.
 */
export const requestListProjects = () => (dispatch) => {
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

export const loadControl = (projectId, controlId) => (dispatch) => {
  const { controls } = projects[projectId];
  const control = controls[controlId];

  dispatch({
    type: 'SET_PROJECT_CONTROL',
    projectId,
    controlId,
    ...control.getExportData(),
  });
};

export const loadControls = projectId => (dispatch) => {
  const { controlsList } = projects[projectId];

  controlsList.forEach(({
    controlId,
  }) => {
    dispatch(loadControl(projectId, controlId));
  });

  dispatch({ type: 'SET_PROJECT_CONTROLS_LIST', projectId, controlsList });
};

export const loadImages = projectId => (dispatch) => {
  const { images } = projects[projectId];

  dispatch({
    type: 'SET_PROJECT_IMAGES',
    projectId,
    images,
  });
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

  // Get the controls for the UI
  dispatch(loadControls(projectId));

  // Move onto the project page
  dispatch(openProjectPage(projectId));

  // Start listening for saving/saved indicator updates
  // TODO this is not implemented on LocalProjectStore!
  ProjectStore.removeAllListeners(`saving-${projectId}`);
  ProjectStore.removeAllListeners(`saved-${projectId}`);

  dispatch({ type: 'PROJECT_RESET_SAVING', projectId });

  ProjectStore.on(`saving-${projectId}`, () => {
    dispatch({ type: 'PROJECT_SAVING', projectId });
  });

  ProjectStore.on(`saved-${projectId}`, () => {
    dispatch({ type: 'PROJECT_SAVED', projectId });
  });

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
  if (project === undefined) return;

  const sequence = project.sequences[sequenceId];
  if (sequence === undefined) return;

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

/**
 * Replaces the entire images object in the project and also updates the state.
 */
const replaceProjectImages = (projectId, images) => (dispatch) => {
  const project = projects[projectId];
  project.images = images;

  dispatch(loadImages(projectId));
  dispatch(validateProject(projectId));
};

const clearSequenceTasks = (projectId, sequenceId) => ({
  type: 'CLEAR_PROJECT_SEQUENCE_TASKS',
  projectId,
  sequenceId,
});

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
      onComplete: ({ result }) => {
        resolve(result);
      },
      onError: (e) => {
        reject(e);
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
  const sequence = project.sequences[sequenceId];
  const { filesList, files } = sequence;

  const createTaskId = uuidv4();
  const probeTaskId = uuidv4();
  const itemsTaskId = uuidv4();
  const encodeTaskId = uuidv4();

  dispatch(clearSequenceTasks(projectId, sequenceId));

  dispatch(setTaskProgress(createTaskId, 0, 0));
  dispatch(setFilesLoading(projectId, sequenceId, true, createTaskId));

  // load current info from store into state
  dispatch(loadSequenceFiles(projectId, sequenceId));

  // bind file service methods to pass into task creator
  const registerAll = fileService.registerAll.bind(fileService);
  const probeAll = fileService.probeAll.bind(fileService);
  const itemsAll = fileService.itemsAll.bind(fileService);
  const encodeAll = fileService.encodeAll.bind(fileService);

  // Register the files with the server, this also checks if the file exists on the file system.
  createTaskWithProgress(
    dispatch,
    registerAll,
    createTaskId,
    filesList.map(({ fileId }) => {
      const { path } = files[fileId] || {};
      return { fileId, path };
    }),
  )
    .then((result) => {
      // update error messages based on result
      dispatch(setFileProperties(
        projectId, sequenceId,
        result.map(({ success, fileId }) => ({
          fileId,
          error: success ? null : 'File is missing.',
        })),
      ));

      // Hide loader, display file list with pending probe/items result.
      dispatch(setFilesLoading(projectId, sequenceId, false, createTaskId));

      // Pass on a list of fileIds for the existing files (marked as successful in result).
      return result
        .filter(({ success }) => success)
        .map(({ fileId }) => ({ fileId }));
    })
    .then((existingFiles) => {
      // Trigger the probe analysis for every existing file. As this is fast, it is done even if not
      // all files were successful, so that the interface can be updated with the file stats.
      dispatch(setProbeTaskId(projectId, sequenceId, probeTaskId));
      return createTaskWithProgress(dispatch, probeAll, probeTaskId, existingFiles);
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

      // Otherwise, get the item information for files that already have it, and upload it to the
      // server so it will be cached for use in encoding and export tasks.
      const filesForItems = [];
      filesList.forEach(({ fileId }) => {
        if ((fileId in files) && !!files[fileId].items) {
          filesForItems.push({
            fileId,
            items: files[fileId].items,
          });
        } else {
          filesForItems.push({
            fileId,
          });
        }
      });

      dispatch(setItemsTaskId(projectId, sequenceId, itemsTaskId));
      return createTaskWithProgress(dispatch, itemsAll, itemsTaskId, filesForItems);
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

      // Get information about previously encoded files and upload it to be cached for use in
      // export tasks.
      // Split the completeFiles list into those that do and those that do not have their
      // encodedItemsBasePath set - if they already have it, they do not need to be encoded again.
      const filesForEncode = [];
      filesList.forEach(({ fileId }) => {
        if (fileId in files && files[fileId].encodedItems) {
          const { encodedItems, encodedItemsBasePath } = files[fileId];
          filesForEncode.push({
            fileId,
            encodedItems,
            encodedItemsBasePath,
          });
        } else {
          filesForEncode.push({
            fileId,
          });
        }
      });

      // Trigger encoding of all files, too, and pass on the results.
      dispatch(setEncodeTaskId(projectId, sequenceId, encodeTaskId));
      return createTaskWithProgress(dispatch, encodeAll, encodeTaskId, filesForEncode);
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


const checkImageFiles = projectId => (dispatch) => {
  const project = projects[projectId];
  const { images } = project;

  // TODO may not need a task for this as progress is not shown anywhere yet.
  const createTaskId = uuidv4();

  dispatch(setTaskProgress(createTaskId, 0, 0));

  // bind file service methods to pass into task creator
  const registerAll = fileService.registerAll.bind(fileService);

  // Register the files with the server, this also checks if the file exists on the file system.
  createTaskWithProgress(
    dispatch,
    registerAll,
    createTaskId,
    Object.keys(images).map((imageId) => {
      const { imagePath } = images[imageId] || {};
      return {
        fileId: imageId,
        path: imagePath,
      };
    }),
  )
    .then((result) => {
      // Create updated images object
      // TODO this re-creates each image object (analyseAllFiles only updates changed properties).
      const updatedImages = {};
      result.forEach(({ success, fileId }) => {
        const imageId = fileId;

        updatedImages[imageId] = {
          imageId,
          imagePath: images[imageId].imagePath,
          error: success ? null : 'Image file is missing.',
        };
      });

      // update error messages etc based on result
      dispatch(replaceProjectImages(
        projectId,
        updatedImages,
      ));
    });
};

/**
 * Action creator, opens a specified project from the store (or triggers a file-open dialogue).
 */
export const requestOpenProject = (existingProjectId = null) => (dispatch) => {
  ProjectStore.openProject(existingProjectId)
    .then(({ cancelled, projectId, store }) => {
      if (cancelled) {
        // do nothing if the user cancelled the open dialog
        return;
      }
      projects[projectId] = new Project(store);
      projects[projectId].sequencesList.forEach(({ sequenceId }) => {
        // trigger background analysis for all files in any of the sequences in the opened project.
        dispatch(analyseAllFiles(projectId, sequenceId));

        // load the object metadata
        dispatch(loadSequenceObjects(projectId, sequenceId));
      });
      dispatch(checkImageFiles(projectId));
      dispatch(loadImages(projectId));
      dispatch(openedProject(projectId));
    })
    .catch((e) => {
      console.error(e);
      dispatch(setAppWarning('The project file could not be opened and has been removed from the list of recent projects.'));
      dispatch(closeProject());
      dispatch(requestListProjects());
    });
};

/**
 * Action creator, creates a new project in the store (or triggers a file-save dialogue) and opens
 * it.
 */
export const requestCreateProject = () => (dispatch) => {
  ProjectStore.createProject()
    .then(({ cancelled, projectId, store }) => {
      if (cancelled) {
        return;
      }
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
      dispatch(setAppWarning('The project file could not be created.'));
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
  if (!projectId) {
    console.error(`Cannot delete project without a projectId (got ${projectId})`);
    return;
  }

  ProjectStore.deleteProject(projectId).then(() => {
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
  const sequence = project.sequences[sequenceId];

  const suffixToChannelMapping = {
    _L: 'left',
    _R: 'right',
    _M: 'mono',
    _C: 'mono',
  };

  const suffixToPanning = {
    _L: -1,
    _R: 1,
    _M: 0,
    _C: 0,
  };

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
        objectBehaviours: [],
        label,
        fileId,
        panning: suffixToPanning[suffix] || 0,
        channelMapping: suffixToChannelMapping[suffix] || 'mono',
      };
    } else {
      // Merge the object with the defaults, to ensure there are values for all fields.
      // overwrite the label and fileId because these are always based on the file.
      newObjects[objectNumber] = {
        ...newObjects[objectNumber],
        objectBehaviours: [
          ...(newObjects[objectNumber].objectBehaviours || []),
        ],
        label,
        fileId,
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
    if (files.some(({ name }) => !parseInt(name, 10))) {
      dispatch(setAppWarning('All imported audio files must start with a non-zero number, e.g. 01_foo.wav. The numbers are used to link audio files to object IDs.'));
      throw new Error('Audio file names must start with a non-zero number');
    }

    dispatch(initialiseSequenceFiles(projectId, sequenceId, files));
    dispatch(confirmSequenceAudioReplaced('New audio files linked.'));
    dispatch(validateProject(projectId));
  }).catch((e) => {
    console.error(e);
    dispatch(setSequenceAudioError('No valid files selected.'));
  });
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
  dispatch(validateProject(projectId));
};

export const setObjectPanning = (
  projectId, sequenceId, objectNumber, panning,
) => (dispatch) => {
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];

  // Get channel mapping from panning
  let newChannelMapping;
  if (panning < 0) { newChannelMapping = 'left'; } else
  if (panning > 0) { newChannelMapping = 'right'; } else
  if (panning === 0) { newChannelMapping = 'mono'; }

  const object = sequence.objects[objectNumber];
  const newObject = {
    ...object,
    channelMapping: newChannelMapping,
    panning, // : channelMappingToPanning[channelMapping],
  };

  sequence.objects = {
    ...sequence.objects,
    [objectNumber]: newObject,
  };

  dispatch(loadSequenceObjects(projectId, sequenceId));
};

export const addObjectBehaviour = (
  projectId,
  sequenceId,
  objectNumber,
  behaviourType,
  behaviourParameters,
) => (dispatch) => {
  // get the original sequence and object
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];
  const object = sequence.objects[objectNumber];

  // create a new (empty) behaviour of the given type
  const newBehaviour = {
    behaviourId: uuidv4(),
    behaviourType,
    behaviourParameters,
  };

  // create a new object, adding the new behaviour into the object's list of behaviours
  const newObject = {
    ...object,
    objectBehaviours: [
      ...object.objectBehaviours,
      newBehaviour,
    ],
  };

  // replace the object in the sequence
  sequence.objects = {
    ...sequence.objects,
    [objectNumber]: newObject,
  };

  // reload the sequence objects to update the UI
  dispatch(loadSequenceObjects(projectId, sequenceId));
};

export const deleteObjectBehaviour = (
  projectId, sequenceId, objectNumber, deleteBehaviourId,
) => (dispatch) => {
  // get the original sequence and object
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];
  const object = sequence.objects[objectNumber];

  // create a new object, removing the behaviour from its list of behaviours
  const newObject = {
    ...object,
    objectBehaviours: object.objectBehaviours
      .filter(({ behaviourId }) => behaviourId !== deleteBehaviourId),
  };

  // replace the object in the sequence
  sequence.objects = {
    ...sequence.objects,
    [objectNumber]: newObject,
  };

  // reload the sequence objects to update the UI
  dispatch(loadSequenceObjects(projectId, sequenceId));
};

export const replaceObjectBehaviourParameters = (
  projectId, sequenceId, objectNumber, behaviourId, behaviourParameters,
) => (dispatch) => {
  // get the original sequence and object
  const project = projects[projectId];
  const sequence = project.sequences[sequenceId];
  const object = sequence.objects[objectNumber];

  // create a new object, with the behaviour parameters replaced
  const newObject = {
    ...object,
    objectBehaviours: object.objectBehaviours.map((behaviour) => {
      if (behaviour.behaviourId !== behaviourId) return behaviour;

      return {
        ...behaviour,
        behaviourParameters,
      };
    }),
  };

  // replace the object in the sequence
  sequence.objects = {
    ...sequence.objects,
    [objectNumber]: newObject,
  };

  // reload the sequence objects to update the UI
  dispatch(loadSequenceObjects(projectId, sequenceId));
};

export const addControl = (
  projectId,
  controlType,
  controlName,
  controlParameters,
  controlDefaultValues,
) => (dispatch) => {
  const project = projects[projectId];
  project.addControl({
    controlType,
    controlName,
    controlParameters,
    controlDefaultValues,
  });

  // reload the controls to update the UI
  dispatch(loadControls(projectId));
};

export const deleteControl = (projectId, controlId) => (dispatch) => {
  const project = projects[projectId];
  project.deleteControl(controlId);

  // reload the controls to update the UI
  dispatch(loadControls(projectId));
};

// TODO should probably be separate actions to prevent overwriting private properties of control
export const replaceControlProperty = (projectId, controlId, name, value) => (dispatch) => {
  const project = projects[projectId];
  const control = project.controls[controlId];

  // Update the named cntrol value
  control[name] = value;

  // Update the controls list because the control name or type might have changed
  project.updateControlsList();

  // reload the controls to update the UI
  dispatch(loadControls(projectId));
};

export const swapControlOrder = (projectId, controlId, otherControlId) => (dispatch) => {
  const project = projects[projectId];

  project.swapControlOrder(controlId, otherControlId);

  dispatch(loadControls(projectId));
};

/**
 * opens a file-open dialogue and if an image is selected, replaces the project's player image;
 * deleting the link to the previous image as well.
 */
export const requestReplaceProjectPlayerImage = projectId => (dispatch) => {
  const project = projects[projectId];

  // TODO mostly copied from replaceAllAudioFiles, refactor? esp. for using images elsewhere.
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
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
    const { images, settings } = project;
    const { playerImageId } = settings;

    const newImageId = uuidv4();

    const { path } = files[0];

    const updatedImages = {
      ...images,
      [newImageId]: {
        imageId: newImageId,
        imagePath: path,
      },
    };

    if (playerImageId in updatedImages) {
      delete updatedImages[playerImageId];
    }
    project.images = updatedImages;

    dispatch(loadImages(projectId));
    dispatch(checkImageFiles(projectId));
    dispatch(setProjectSetting(projectId, 'playerImageId', newImageId));
  }).catch((e) => {
    console.warn(e);
    setAppWarning('No image file selected, please try again.');
  });
};
