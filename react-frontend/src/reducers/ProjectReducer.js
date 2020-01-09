const initialState = {
  projectsList: [],
  projectsListLoading: false,
  allowFileOpen: false,
  // per project settings, accessed by project id. each will include sequence and file objects.
  projects: {},
};

const projectDefaults = {
  settings: {},
  sequencesList: [],
  sequencesListLoading: false,
  sequences: {},
  controls: {},
  controlsList: [],
  reviewItems: [],
};

const sequenceDefaults = {
  filesTaskId: null,
  filesLoading: false,
  filesList: [],
  files: {},
  objectsList: [],
  objects: {},
  isIntro: false,
  loop: false,
  hold: false,
  skippable: false,
  next: [],
  probeTaskId: null,
  itemsTaskId: null,
  encodeTaskId: null,
};

const controlDefaults = {
  controlId: '',
  controlName: '',
  controlType: 'text',
  controlDefaultValues: [],
  controlParameters: {},
  controlBehaviours: [],
};

const fileDefaults = {
  error: null,
  probe: null,
  items: null,
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
const updateSequence = (state, projectId, sequenceId, update) => {
  const project = state.projects[projectId] || projectDefaults;
  return {
    ...state,
    projects: {
      ...state.projects,
      [projectId]: {
        ...project,
        sequences: {
          ...project.sequences,
          [sequenceId]: {
            ...(project.sequences[sequenceId] || sequenceDefaults),
            ...update,
          },
        },
      },
    },
  };
};

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
    updatedFile.items = !!updatedFile.items; // don't store detailed results, just a boolean.
    updatedFiles[update.fileId] = updatedFile;
  });

  // replace the files object in the state
  return updateSequence(state, projectId, sequenceId, { files: updatedFiles });
};

// Convenience method for updating nested properties in a specific control in a specific project.
const updateControl = (state, projectId, controlId, update) => {
  const project = state.projects[projectId] || projectDefaults;
  return {
    ...state,
    projects: {
      ...state.projects,
      [projectId]: {
        ...project,
        controls: {
          ...(project.controls || {}),
          [controlId]: {
            ...(project.controls[controlId] || controlDefaults),
            ...update,
          },
        },
      },
    },
  };
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
    case 'SET_PROJECT_SETTINGS':
      return updateProject(
        state, action.projectId,
        { settings: action.settings },
      );
    case 'SET_PROJECT_REVIEW_ITEMS':
      return updateProject(state, action.projectId, { reviewItems: action.reviewItems });
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
    case 'SET_PROJECT_SEQUENCE_INFO':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        {
          name: action.name,
          isIntro: action.isIntro,
          loop: action.loop,
          skippable: action.skippable,
          hold: action.hold,
          next: action.next,
        },
      );
    case 'CLEAR_PROJECT_SEQUENCE_TASKS':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        {
          probeTaskId: null,
          itemsTaskId: null,
          encodeTaskId: null,
        },
      );
    case 'SET_PROJECT_SEQUENCE_FILES_LOADING':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        {
          filesLoading: action.loading,
          filesTaskId: action.taskId,
        },
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
    case 'SET_PROJECT_SEQUENCE_PROBE_TASK':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        { probeTaskId: action.taskId },
      );
    case 'SET_PROJECT_SEQUENCE_ITEMS_TASK':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        { itemsTaskId: action.taskId },
      );
    case 'SET_PROJECT_SEQUENCE_ENCODE_TASK':
      return updateSequence(
        state, action.projectId, action.sequenceId,
        { encodeTaskId: action.taskId },
      );
    case 'SET_PROJECT_SEQUENCE_FILE_PROPERTIES':
      return updateFiles(state, action.projectId, action.sequenceId, action.files);
    case 'SET_PROJECT_CONTROLS_LIST':
      return updateProject(state, action.projectId, {
        controlsList: action.controlsList,
      });
    case 'SET_PROJECT_CONTROL':
      return updateControl(state, action.projectId, action.controlId, {
        controlId: action.controlId,
        controlName: action.controlName,
        controlType: action.controlType,
        controlDefaultValues: action.controlDefaultValues,
        controlParameters: action.controlParameters,
        controlBehaviours: action.controlBehaviours,
      });
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: {
          ...state.projects,
          [action.projectId]: null,
        },
        projectsList: state.projectsList.filter(({ projectId }) => projectId !== action.projectId),
      };
    default:
      return state;
  }
};

export default ProjectReducer;
