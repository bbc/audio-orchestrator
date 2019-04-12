import uuidv4 from 'uuid/v4';
import LocalProjectStore from '../lib/LocalProjectStore';
import FileService from '../lib/FileService';

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
  dispatch({ type: 'UI_CLOSE_PROJECT' });
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
 * Action creator, populates the state with info from the opened project and updates the UI.
 *
 * For use by other actions in this file only so not exported.
 */
const openedProject = projectId => (dispatch) => {
  // Set the project name for use in UI
  dispatch({ type: 'SET_PROJECT_NAME', projectId, name: projects[projectId].get('name') });

  // Move onto the project page - this will trigger requesting more project data for each UI page.
  dispatch({ type: 'UI_OPEN_PROJECT', projectId });

  // Hide the loading indicator
  dispatch({ type: 'SET_PROJECT_LOADING', projectId, loading: false });
};

/**
 * Internal action creator, sets properties on a specified file in project store and local state.
 */
const setFileProperties = (projectId, sequenceId, files) => (dispatch) => {
  // update the interface state
  dispatch({
    type: 'SET_PROJECT_SEQUENCE_FILE_PROPERTIES',
    projectId,
    sequenceId,
    files,
  });

  // update the project store
  const project = projects[projectId];
  const key = `sequences.${sequenceId}.files`;
  const updatedFiles = {
    ...project.get(key),
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

  project.set(key, updatedFiles);
};

/**
 * Action creator, updates the user interface with the list of files for the sequence.
 */
export const getSequenceFiles = (projectId, sequenceId) => (dispatch) => {
  // TODO apply the same filtering here as in setFileProperties (e.g. remove path, silence results)
  // ^^ this currently happens in reducer.
  dispatch({
    type: 'SET_PROJECT_SEQUENCE_FILES',
    projectId,
    sequenceId,
    filesList: projects[projectId].get(`sequences.${sequenceId}.filesList`, []),
    files: projects[projectId].get(`sequences.${sequenceId}.files`, {}),
  });
};

const setFilesLoading = (projectId, sequenceId, loading, taskId) => ({
  type: 'SET_PROJECT_SEQUENCE_FILES_LOADING',
  projectId,
  sequenceId,
  loading,
  taskId,
});

export const getSequenceObjects = (projectId, sequenceId) => (dispatch) => {
  dispatch({
    type: 'SET_PROJECT_SEQUENCE_OBJECTS',
    projectId,
    sequenceId,
    objectsList: projects[projectId].get(`sequences.${sequenceId}.objectsList`, []),
    objects: projects[projectId].get(`sequences.${sequenceId}.objects`, {}),
  });
};

const setTaskProgress = (taskId, completed, total) => ({
  type: 'UI_SET_TASK_PROGRESS',
  taskId,
  completed,
  total,
});

/**
 * Internal action creator, checks files still exist and triggers all missing analysis steps for
 * all files referenced by the sequence.
 */
const analyseAllFiles = (projectId, sequenceId) => (dispatch) => {
  const project = projects[projectId];
  const filesList = project.get(`sequences.${sequenceId}.filesList`, []);
  const files = project.get(`sequences.${sequenceId}.files`, {});

  console.log('analyseAllFiles', filesList.length);

  const createTaskId = uuidv4();
  dispatch(setTaskProgress(createTaskId, 0, 0));
  dispatch(setFilesLoading(projectId, sequenceId, true, createTaskId));

  // load current info from store into state
  dispatch(getSequenceFiles(projectId, sequenceId));

  fileService.createAll( // check files still exist
    filesList.map(({ fileId }) => {
      const { path } = files[fileId] || {};
      return { fileId, path };
    }),
    {
      onProgress: ({ completed, total }) => {
        dispatch(setTaskProgress(createTaskId, completed, total));
      },
    },
  ).then((results) => { // update state and store with results
    // update error messages based on results
    dispatch(setFileProperties(
      projectId, sequenceId,
      results.map(({ success, fileId }) => ({
        fileId,
        error: success ? null : 'File could not be accessed.',
      })),
    ));

    // Hide loader, display file list with pending probe/silence results
    dispatch(setFilesLoading(projectId, sequenceId, false, createTaskId));

    // for all successfully accessed files, get probe and silence data
    return results.filter(({ success }) => success).map(({ fileId }) => {
      // TODO can get rid of most of this now it's all in one object and already 'loaded'???
      // load the previous analysis results, if available
      const { probe, silence } = files[fileId];

      return {
        fileId,
        probe,
        silence,
      };
    });
  }).then((successfulFiles) => {
    // Propagate previous results, if any, to state for immediate display in UI
    dispatch(setFileProperties(projectId, sequenceId, successfulFiles));

    // run probe analysis on existing files, if probe or silence data doesn't already exist
    Promise.all(
      // run probe analysis on all files that are missing probe or silence results
      successfulFiles.filter(({ probe, silence }) => !probe || !silence)
        .map(({ fileId }) => fileService.probe(fileId)
          .then(probeResults => ({
            fileId,
            probe: probeResults,
            success: true,
          }))
          .catch(() => ({ fileId, success: false }))),
    )
      // once all probes have resolved, update files with results or error message
      .then((results) => {
        // create file update objects with the new status and pass on to state/project store.
        dispatch(setFileProperties(
          projectId, sequenceId,
          results.map(({ success, fileId, probe }) => ({
            fileId,
            error: success ? null : 'Analysis failed, file may not contain an audio stream.',
            probe: success ? probe : null,
          })),
        ));

        // forward the unchanged probe results to the next step
        return results;
      })
      // Run silence analysis (on successfully probed files only)
      .then(results => (Promise.all(
        results.filter(({ success }) => success)
          .map(({ fileId }) => fileService.silence(fileId)
            .then(silence => ({
              fileId,
              success: true,
              silence,
            }))
            .catch(() => ({ fileId, success: false }))),
      )))
      // Once all the silence promises have resolved, store the results as before for probes
      .then((results) => {
        dispatch(setFileProperties(
          projectId, sequenceId,
          results.map(({ success, fileId, silence }) => ({
            fileId,
            error: success ? null : 'Analysis failed, file may not be readable by silence analysis script.',
            silence: success ? silence : null,
          })),
        ));
        return results;
      });
  });
};

/**
 * Action creator, opens a specified project from the store (or triggers a file-open dialogue).
 */
export const requestOpenProject = (projectId = null) => (dispatch) => {
  dispatch({ type: 'SET_PROJECT_LOADING', projectId, loading: true });

  ProjectStore.openProject(projectId)
    .then((store) => {
      projects[projectId] = store;
    })
    .then(() => {
      projects[projectId].get('sequencesList').forEach(({ sequenceId }) => {
        // TODO load pretty much everything here and get rid of the "onGetFoo" dispatches in components.
        // trigger background analysis for all files in any of the sequences in the opened project.
        dispatch(analyseAllFiles(projectId, sequenceId));

        // load the object metadata
        dispatch(getSequenceObjects(projectId, sequenceId));
      });
    })
    .then(() => {
      dispatch(openedProject(projectId));
    })
    .catch((e) => {
      console.info(e);
      dispatch(closeProject());
    });
};

/**
 * Action creator, gets the list of sequences in the project from the store.
 */
export const getSequencesList = projectId => (dispatch) => {
  dispatch({ type: 'SET_PROJECT_SEQUENCES_LIST_LOADING', projectId, loading: true });

  const sequencesList = projects[projectId].get('sequencesList', []);

  sequencesList.forEach(({
    sequenceId,
    name,
    isMain,
    isIntro,
  }) => {
    dispatch({
      type: 'SET_PROJECT_SEQUENCE_INFO',
      projectId,
      sequenceId,
      name,
      isMain,
      isIntro,
    });
  });

  dispatch({ type: 'SET_PROJECT_SEQUENCES_LIST', projectId, sequencesList });

  dispatch({ type: 'SET_PROJECT_SEQUENCES_LIST_LOADING', projectId, loading: false });
};

/**
 * Action creator, creates a new empty sequence in the project
 */
export const addSequence = (projectId, { name, isMain, isIntro } = {}) => (dispatch) => {
  // Get current list and write back the list with one added element.
  const sequencesList = projects[projectId].get('sequencesList', []);
  const sequenceId = sequencesList.length;
  const newSequencesList = [
    ...sequencesList,
    {
      sequenceId,
      name: (name || `Sequence ${sequencesList.length + 1}`),
      isMain,
      isIntro,
    },
  ];

  projects[projectId].set('sequencesList', newSequencesList);

  dispatch(getSequencesList(projectId));
};

/**
 * Action creator, creates a new project in the store (or triggers a file-save dialogue).
 */
export const requestCreateProject = () => (dispatch) => {
  dispatch({ type: 'SET_PROJECT_LOADING', loading: true });

  ProjectStore.createProject()
    .then(({ projectId, store }) => {
      projects[projectId] = store;
      dispatch(addSequence(projectId, { name: 'Main', isMain: true }));
      dispatch(addSequence(projectId, { name: 'Intro Loop', isIntro: true }));
      dispatch(openedProject(projectId));
    })
    .catch((e) => {
      console.info(e);
      dispatch(closeProject());
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
  projects[projectId].set('name', name);
  dispatch({ type: 'SET_PROJECT_NAME', projectId, name });
};

/**
 * Action creator, changes a single value in the project's settings.
 */
export const setProjectSetting = (projectId, key, value) => (dispatch) => {
  const settings = projects[projectId].get('settings', {});
  const newSettings = { ...settings, [key]: value };
  projects[projectId].set('settings', newSettings);

  dispatch({ type: 'SET_PROJECT_SETTINGS', projectId, settings: newSettings });
};

/**
 * Action creator, gets the project settings from the store.
 */
export const getProjectSettings = projectId => (dispatch) => {
  dispatch({ type: 'SET_PROJECT_SETTINGS_LOADING', projectId, loading: true });
  dispatch({ type: 'SET_PROJECT_SETTINGS', projectId, settings: projects[projectId].get('settings', {}) });
  dispatch({ type: 'SET_PROJECT_SETTINGS_LOADING', projectId, loading: false });
};

const fileNameToObjectNumber = name => parseInt(name, 10) || null;

/**
 * Attempt to link objects to files. Update project store with results.
 */
const matchObjectsToFiles = (projectId, sequenceId) => {
  // load required data from project store
  const project = projects[projectId];
  const filesList = project.get(`sequences.${sequenceId}.filesList`, []);
  const files = project.get(`sequences.${sequenceId}.files`, {});
  const objectsList = project.get(`sequences.${sequenceId}.objectsList`, []);
  const objects = project.get(`sequences.${sequenceId}.objects`, {});

  // select or create objects for all files, updating only fileId if one already exists
  filesList
    .forEach(({ fileId, name }) => {
      // do not create dummy objects for files that don't match the naming convention (TODO: error?)
      const objectNumber = fileNameToObjectNumber(name);
      if (objectNumber === null) {
        console.warn(`${name} does not match naming convention, should start with a number`);
      }

      // merge with existing object if there already was one.
      objects[objectNumber] = {
        ...(objects[objectNumber] || {}),
        ...{ objectNumber, fileId },
      };
    });

  // remove fileId from objects where the file doesn't exist anymore
  objectsList.forEach(({ objectNumber }) => {
    const { fileId } = objects[objectNumber];
    if (!(fileId in files)) {
      objects[objectNumber].fileId = null;
    }
  });

  // select files for objects that don't have a corresponding file: this case should be covered
  // above; if the objects list is replaced no file would have a matching object.

  // update project with modified objects
  project.set(`sequences.${sequenceId}.objects`, objects);

  // Note that the objectsList is not updated, because only objects that are listed in the metadata
  // files should be displayed in the interface; and the objectsList is created when it is loaded.
};

/**
 * Replace all file information in the sequence with the supplied list of file objects expected to
 * contain { name, path, fileId }.
 */
const initialiseSequenceFiles = (projectId, sequenceId, newFiles) => (dispatch) => {
  // assign a unique ID to each file
  const filesWithIds = newFiles.map(file => ({ ...file, fileId: uuidv4() }));

  const project = projects[projectId];
  const key = `sequences.${sequenceId}.files`;
  const listKey = `sequences.${sequenceId}.filesList`;

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
  project.set(key, files);
  project.set(listKey, filesList);

  // attempt to link objects to these new files; or create placeholder objects.
  matchObjectsToFiles(projectId, sequenceId);

  // update the interface state to match what was just stored
  dispatch(getSequenceFiles(projectId, sequenceId));
  dispatch(getSequenceObjects(projectId, sequenceId));

  // trigger analysis of the new files and update the UI, also updating files in store and state.
  // TODO could re-use analysis results if some of the files have been used previously, here we
  // assume they are all new.
  dispatch(analyseAllFiles(projectId, sequenceId));
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
  }).catch((e) => {
    console.error(e);
  });
};

/**
 * Action creator, change a property of a sequence in the state and store.
 */
export const setSequenceSetting = (projectId, sequenceId, settingKey, value) => (dispatch) => {
  const key = `sequences.${sequenceId}.settings`;
  const settings = projects[projectId].get(key, {});
  const newSettings = { ...settings, [settingKey]: value };
  projects[projectId].set(key, newSettings);

  dispatch({ type: 'SET_PROJECT_SEQUENCE_SETTINGS', projectId, settings: newSettings });
};

/**
 * Action creator, changes a sequence's name.
 */
export const setSequenceName = (projectId, sequenceId, name) => (dispatch) => {
  // replace name in sequences list stored with the project file
  const sequencesList = projects[projectId].get('sequencesList', []);
  const newSequencesList = sequencesList.map(sequence => ({
    ...sequence,
    name: (sequence.sequenceId === sequenceId) ? name : sequence.name,
  }));
  projects[projectId].set('sequencesList', newSequencesList);

  // update the sequences list also in the UI
  dispatch(getSequencesList(projectId));
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
    reject(new Error(''));
  });
  reader.addEventListener('loadend', () => {
    const metadata = JSON.parse(reader.result) || {};
    const objects = metadata.mdoObjects || null;

    if (!Array.isArray(objects) || objects.length === 0) {
      reject(new Error('Could not parse metadata file, format may be invalid or it may not contain any objects.'));
      return;
    }

    if (!objects.every(object => ('objectNumber' in object && 'label' in object))) {
      reject(new Error('Not every object has a number and label.'));
      return;
    }
    resolve(objects);
  });

  // start reading the file, will trigger the error or loadend event when finished.
  reader.readAsText(file);
});

/**
 * Action; replaces the objects associated with the given sequence, updates the project store, and
 * dispatches an update to the UI state.
 *
 * @param {Array<Object>} newObjects
 */
const initialiseSequenceObjects = (projectId, sequenceId, newObjectsList) => (dispatch) => {
  const project = projects[projectId];
  const oldObjects = project.get(`sequences.${sequenceId}.objects`, {});

  const suffixToChannelMapping = {
    L: 'left',
    R: 'right',
    M: 'mono',
    S: 'stereo', // not supported in encoding or playback; included here for completeness.
  };
  const suffixToPanning = {
    L: 30,
    R: -30,
    M: 0,
  };

  const objects = {};
  const objectsList = newObjectsList.map(({ objectNumber, label }) => ({
    objectNumber: parseInt(objectNumber, 10),
    label,
  }));
  newObjectsList.forEach(({
    objectNumber,
    label,
    // group,
    mdoThreshold,
    mdoOnly,
    // mdoMethod,
    // speakerNumber,
    // diffuseness,
    mdoSpread,
    // mdoDynamic,
    // mdoGainDB,
    muteIfObject,
    exclusivity,
    nearFront,
    nearSide,
    nearRear,
    farFront,
    farSide,
    farRear,
    above,
    onDropin,
    onDropout,
    minQuality,
  }) => {
    const objectNumberInt = parseInt(objectNumber, 10);
    const oldObject = oldObjects[objectNumberInt] || {};
    const suffix = label[label.length - 1] || 0;
    objects[objectNumberInt] = ({
      objectNumber: objectNumberInt,
      label,
      fileId: null,
      panning: oldObject.panning || suffixToPanning[suffix] || 0,
      channelMapping: oldObject.channelMapping || suffixToChannelMapping[suffix] || 'mono',
      orchestration: {
        // group,
        mdoThreshold,
        mdoOnly,
        // mdoMethod,
        // speakerNumber,
        // diffuseness,
        mdoSpread,
        // mdoDynamic,
        // mdoGainDB,
        muteIfObject,
        exclusivity,
        nearFront,
        nearSide,
        nearRear,
        farFront,
        farSide,
        farRear,
        above,
        onDropin,
        onDropout,
        minQuality,
        image: oldObject.image || null,
      },
    });
  });

  // store results in project store
  project.set(`sequences.${sequenceId}.objectsList`, objectsList);
  project.set(`sequences.${sequenceId}.objects`, objects);

  // Update store with new object-file mappings
  matchObjectsToFiles(projectId, sequenceId);

  // load objects into state.
  dispatch(getSequenceObjects(projectId, sequenceId));
};

/**
 * Replace metadata file, open a file-open dialogue and replace the object metadata if a valid file
 * is selected.
 */
export const requestReplaceMetadata = (projectId, sequenceId) => (dispatch) => {
  new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json, .txt';
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
  }).catch((e) => {
    console.error(e); // TODO dispatch error action to display a dismissable message in UI
  });
};
