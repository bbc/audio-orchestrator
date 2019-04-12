const initialState = {
  projectsList: [],
  projectsListLoading: false,
  allowFileOpen: false,
  // per project settings, accessed by project id. each will include sequence and file objects.
  projects: {},
};

const projectDefaults = {
  settings: {},
  settingsLoading: false,
  sequencesList: [],
  sequencesListLoading: false,
  sequences: {},
};

const sequenceDefaults = {
  filesTaskId: null,
  filesLoading: false,
  filesList: [],
  files: {},
  isMain: false,
  isIntro: false,
};

const fileDefaults = {
  error: null,
  probe: null,
  silence: null,
};


// Convenience method for updating nested properties in a specific project.
const updateProject = (state, projectId, update) => ({
  ...state,
  projects: {
    ...state.projects,
    [projectId]: {
      ...(state.projects[projectId] || projectDefaults),
      ...update,
    },
  },
});

// Convenience method for updating nested properties in a specific sequence in a specific project.
const updateSequence = (state, projectId, sequenceId, update) => ({
  ...state,
  projects: {
    ...state.projects,
    [projectId]: {
      ...state.projects[projectId],
      sequences: {
        ...state.projects[projectId].sequences,
        [sequenceId]: {
          ...(state.projects[projectId].sequences[sequenceId] || sequenceDefaults),
          ...update,
        },
      },
    },
  },
});

// Convenience method for updating nested properties in specified files in a specific sequence.
const updateFiles = (state, projectId, sequenceId, updates) => {
  // make a copy of the old files object
  const updatedFiles = {
    ...state.projects[projectId].sequences[sequenceId].files,
  };

  // replace only those file objects that are contained in the update
  updates.forEach((update) => {
    const updatedFile = {
      ...(updatedFiles[update.fileId] || fileDefaults),
      ...update,
    };
    delete updatedFile.fileId; // don't store fileId as it's redundant
    updatedFile.silence = !!updatedFile.silence; // don't store detailed results, just a boolean.
    updatedFiles[update.fileId] = updatedFile;
  });

  // replace the files object in the state
  return updateSequence(state, projectId, sequenceId, { files: updatedFiles });
};


const ProjectReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'PROJECT_PROJECTS_LIST_LOADING':
      return { ...state, projectsListLoading: true };
    case 'PROJECT_RECEIVED_PROJECTS_LIST':
      return {
        ...state,
        projectsListLoading: false,
        projectsList: action.projectsList,
      };
    case 'PROJECT_PROJECTS_LIST_FAILED':
      return {
        ...state,
        projectsListLoading: false,
        projectsList: [],
      };
    case 'PROJECT_ALLOW_FILE_OPEN':
      return { ...state, allowFileOpen: action.allowFileOpen };
    case 'SET_PROJECT_LOADING':
      return updateProject(state, action.projectId, { loading: action.loading });
    case 'SET_PROJECT_NAME':
      return updateProject(
        state, action.projectId,
        { name: action.name },
      );
    case 'SET_PROJECT_SETTINGS_LOADING':
      return updateProject(
        state, action.projectId,
        { settingsLoading: action.loading },
      );
    case 'SET_PROJECT_SETTINGS':
      return updateProject(
        state, action.projectId,
        { settings: action.settings },
      );
    case 'SET_PROJECT_SEQUENCES_LIST_LOADING':
      return updateProject(
        state, action.projectId,
        { sequencesListLoading: action.loading },
      );
    case 'SET_PROJECT_SEQUENCES_LIST':
      return updateProject(
        state, action.projectId,
        { sequencesList: action.sequencesList },
      );
    case 'SET_PROJECT_SEQUENCE_LOADING':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        { loading: action.loading },
      );
    case 'SET_PROJECT_SEQUENCE_NAME':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        { name: action.name },
      );
    case 'SET_PROJECT_SEQUENCE_FILES_LOADING':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        { audioFilesLoading: action.loading, audioFilesTaskId: action.taskId },
      );
    case 'SET_PROJECT_SEQUENCE_FILES':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        {
          filesList: action.filesList,
          files: action.files,
        },
      );
    case 'SET_PROJECT_SEQUENCE_OBJECTS':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        {
          objectsList: action.objectsList,
          objects: action.objects,
        },
      );
    case 'SET_PROJECT_SEQUENCE_FILE_PROPERTIES':
      return updateFiles(state, action.projectId, action.sequenceId, action.files);
    default:
      return state;
  }
};

export default ProjectReducer;
