import { v4 as uuidv4 } from 'uuid';
import { electronLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import ElectronStore from 'electron-store';
import semver from 'semver';
import {
  dialog,
  BrowserWindow,
} from 'electron';
import {
  getRecentProjects,
  setRecentProject,
  removeRecentProject,
} from './settings';
import migrations from './migrations';
import { version as projectVersion } from '../../package.json';

const migrationsWithNewerVersionCheck = {
  [`<= ${projectVersion}`]: (store) => {
    const fileVersion = store.get('__internal__.migrations.version', '0.0.0');
    if (semver.gt(fileVersion, projectVersion)) {
      throw new Error('The project was created with a more recent version and cannot be opened.');
    }
  },
  ...migrations,
};

const PROJECT_FILE_FILTERS = [
  { name: 'Audio Orchestrator projects', extensions: ['orc'] },
];

const openProjectFiles = {};
const openProjectStores = {};

// Open or create a new project file.
const getProjectStore = (realProjectPath, create = false) => {
  let projectStore = openProjectStores[realProjectPath];

  // if it is not already open, construct a new store
  if (!projectStore) {
    const fileExtension = path.extname(realProjectPath);
    const fileName = path.basename(realProjectPath, fileExtension);
    const dirName = path.dirname(realProjectPath);
    projectStore = new ElectronStore({
      defaults: {
        name: fileName,
      },
      fileExtension: fileExtension.slice(1),
      name: fileName,
      cwd: dirName,
      clearInvalidConfig: !!create,
      // TODO can also add a schema to validate
      migrations: migrationsWithNewerVersionCheck,
      projectVersion,
    });
    openProjectStores[realProjectPath] = projectStore;
  }

  return projectStore;
};

/**
 * open a project from file path. not exported because outside this file projects are only known by
 * their projectId.
 *
 * @returns {Promise<Object>} parsed project file contents
 */
const openProjectFile = (projectFilePath, create = false) => {
  logger.debug(`openProjectFile: ${projectFilePath}`);
  return fse.realpath(projectFilePath).then((realProjectPath) => {
    // Find the projectId for the given path or assign one if not already open.
    let projectId = Object.keys(openProjectFiles)
      .find(key => openProjectFiles[key] === realProjectPath);

    if (!projectId) {
      projectId = uuidv4();
    }

    openProjectFiles[projectId] = realProjectPath;

    // get a project store for this file - create a new one or open it from the path
    const projectStore = getProjectStore(realProjectPath, create);

    // Set the allocated projectId in the project metadata
    projectStore.set('projectId', projectId);

    // set the project name in metadata to the file name in case the file was renamed
    const fileExtension = path.extname(projectFilePath);
    const fileName = path.basename(projectFilePath, fileExtension);
    projectStore.set('name', fileName);

    // get a copy of everything in the store as an object to return
    const project = projectStore.store;

    // Add to most recently used list
    setRecentProject(projectId, projectFilePath, project.name);

    return { projectId, project };
  }).catch((e) => {
    logger.error(`Failed to open project file ${projectFilePath}.`, e);
    removeRecentProject(projectFilePath);
    throw new Error(`Failed to open project file. ${e.message}`);
  });
};

/**
 * open project by ID if given, or show file open dialogue if not given.
 */
export const openProject = (e, projectId) => {
  if (projectId) {
    // Check if it's already open
    const alreadyOpenFile = openProjectFiles[projectId];
    if (alreadyOpenFile) {
      return openProjectFile(alreadyOpenFile);
    }

    // Check if it's in the list of recent projects
    const recentProject = getRecentProjects().find(p => p.projectId === projectId);
    if (recentProject) {
      return openProjectFile(recentProject.projectFilePath);
    }

    return Promise.reject(new Error('Requested projectId does not match an open or recent project.'));
  }

  // if projectId is not set, show a file open dialog.
  return dialog.showOpenDialog(
    BrowserWindow.fromWebContents(e.sender),
    {
      title: 'Open project',
      filters: PROJECT_FILE_FILTERS,
      properties: [
        'openFile',
      ],
    },
  )
    .then(({ filePaths }) => {
      if (!filePaths || filePaths.length === 0) {
        // If no file was selected, just return a flag to say the operation was cancelled.
        logger.debug('user cancelled open dialogue - no filePaths returned');
        return { cancelled: true };
      }

      // Otherwise, try open the selected file
      const [projectFilePath] = filePaths;
      return openProjectFile(projectFilePath);
    });
};

/**
 * creates an empty project file and opens it.
 */
export const createProject = (e, title = 'New project...') => dialog.showSaveDialog(
  BrowserWindow.fromWebContents(e.sender),
  {
    title,
    filters: PROJECT_FILE_FILTERS,
    properties: [
      'openFile',
      'shouldOverWriteConfirmation',
      'createDirectory',
    ],
  },
)
  .then(({ filePath }) => {
    if (!filePath) {
      logger.debug('user cancelled save dialogue - no filePath returned');
      return { cancelled: true };
    }

    // TODO does file mode w truncate even if nothing is written to the file?
    return fse.open(filePath, 'w')
      .then(handle => fse.close(handle))
      .then(() => openProjectFile(filePath, true));
  });

/**
 * Internal helper for saving a project under a different file name, e.g. if regular saving failed.
 * First create a new project to get a file path; then replace the path for the original projectId.
 */
const selectNewProjectFile = (e, projectId) => createProject(e, 'Save project as...')
  .then(({ projectId: newProjectId }) => {
    // move the new path to the old projectId because the client wouldn't know about the new ID.
    removeRecentProject(openProjectFiles[projectId]);
    openProjectFiles[projectId] = openProjectFiles[newProjectId];
    delete openProjectFiles[newProjectId];
  });

/**
 * Save the project data to the file identified by the projectId; or show a save-as dialog to pick
 * a new location if there is an error.
 */
export const saveProject = (e, projectId, project, retries = 1) => {
  if (retries < 0) {
    throw new Error('Could not save project, retries exhausted.');
  }

  if (!(projectId in openProjectFiles)) {
    logger.warn(`Project ${projectId} is not open, asking user for a new location to save.`);
    return selectNewProjectFile(e, projectId)
      .then(() => saveProject(e, projectId, {
        ...project,
        projectId,
      }, retries));
  }

  const projectFilePath = openProjectFiles[projectId];
  const projectStore = openProjectStores[projectFilePath];

  projectStore.store = project;
  projectStore.set('projectId', projectId);

  return Promise.resolve();
};

export const listProjects = () => getRecentProjects();

export const removeRecentProjectById = (projectId) => {
  const { projectFilePath } = getRecentProjects().find(p => p.projectId === projectId);
  removeRecentProject(projectFilePath);
};
