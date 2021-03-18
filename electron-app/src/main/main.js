import { electronLogger as logger, addLogFileTransport } from 'bbcat-orchestration-builder-logging';
import backgroundTasks from 'bbcat-orchestration-builder-background-tasks';
import path from 'path';
import os from 'os';
import { URL } from 'url';
import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  session,
} from 'electron';
import {
  openInFolder,
  saveExportAs,
  saveExportToDownloads,
} from './save-exports';
import backgroundTasksRouter from './backgroundTasksRouter';
import {
  openProject,
  createProject,
  saveProject,
  listProjects,
  removeRecentProjectById,
} from './Projects';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let creditsWin;

// Ensure devMode is only enabled if the environment var is set, and the app is not packaged for
// production. This avoids someone overriding the setting in a packaged app.
const devMode = process.env.NODE_ENV === 'development' && !app.isPackaged;

// Override the name of the application to use in menu entries (cannot use special characters so not
// including 'BBC R&D' prefix here).
app.setName('Audio Orchestrator');

// Define default security settings to use for any newly created BrowserWindows.
const defaultWebPreferences = {
  nodeIntegration: false, // Must be false; setting it to true would allow access to any node module
  enableRemoteModule: false, // Must be false; preload script can still be used
  contextIsolation: true, // Must be true; means that pages cannot modify prototypes used in preload
  sandbox: true, // Must be true.
};

// define log file path
const logFilePath = path.join(app.getPath('userData'), 'bbcat-orchestration-builder.log');
addLogFileTransport(logFilePath);
logger.silly(`Logging to ${logFilePath}`);

// add user data /ffmpeg/bin as extra search path
backgroundTasks.addSearchPath(path.join(app.getPath('userData'), 'ffmpeg', 'bin'));

function createWindow() {
  // Create the browser window.
  // TODO can we remember the previous window size in settings?
  win = new BrowserWindow({
    width: 1280,
    height: 1024,
    webPreferences: {
      ...defaultWebPreferences,
      preload: path.resolve(__dirname, '../renderer/preload.js'),
    },
  });

  // TODO: install devTools - currently not working so commented out
  // if (devMode) {
  //   /* eslint-disable-next-line global-require */
  //   const {
  //     default: installExtension,
  //     REACT_DEVELOPER_TOOLS,
  //     REDUX_DEVTOOLS,
  //   } = require('electron-devtools-installer');
  //   installExtension(REACT_DEVELOPER_TOOLS)
  //     .then(name => logger.info(`Added Extension:  ${name}`))
  //     .catch(err => logger.warn('An error occurred: ', err));
  //   installExtension(REDUX_DEVTOOLS)
  //     .then(name => logger.info(`Added Extension:  ${name}`))
  //     .catch(err => logger.warn('An error occurred: ', err));
  // }

  if (devMode) {
    // load the user interface hosted by webpack-dev-server
    win.loadURL('http://localhost:8080');

    // Open the DevTools.
    win.webContents.openDevTools();
  } else {
    // load the webpack-generated user interface index.html
    win.loadFile('node_modules/bbcat-orchestration-builder-react-frontend/dist/index.html');
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const createCreditsWindow = () => {
  if (creditsWin || !win) return;

  creditsWin = new BrowserWindow({
    width: 800,
    height: 600,
    parent: win,
    webPreferences: {
      ...defaultWebPreferences,
    },
  });

  creditsWin.loadFile('credits.html');

  creditsWin.on('closed', () => {
    creditsWin = null;
  });
};

const registerIpcHandlers = () => {
  // Allow the web page to trigger the developer tools
  ipcMain.handle('open-dev-tools', () => {
    if (win) {
      win.webContents.openDevTools();
    }
  });

  // Allow the web page to open the credits window
  ipcMain.handle('open-credits', () => {
    if (!creditsWin) {
      createCreditsWindow();
    }
  });

  // Allow the web page to open a URL in the default browser
  // TODO same code as in new-window handler below
  ipcMain.handle('open-url', (e, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      shell.openExternal(url);
    }
  });

  // Get information about the platform we are running on
  ipcMain.handle('get-platform-info', () => Promise.resolve({
    platform: os.platform(),
    sep: path.sep,
    delimiter: path.delimiter,
  }));

  // Handlers for saving exports:
  ipcMain.handle('open-in-folder', openInFolder);
  ipcMain.handle('save-export-as', saveExportAs);
  ipcMain.handle('save-export-to-downloads', saveExportToDownloads);

  // Handlers for background tasks API
  ipcMain.handle('background-tasks-get', (e, p) => backgroundTasksRouter.get(p));
  ipcMain.handle('background-tasks-post', (e, p, d) => backgroundTasksRouter.post(p, d));
  ipcMain.handle('background-tasks-delete', (e, p) => backgroundTasksRouter.delete(p));

  // Handlers for project store API
  ipcMain.handle('project-open', (e, projectId) => openProject(e, projectId));
  ipcMain.handle('project-create', e => createProject(e));
  ipcMain.handle('project-save', (e, projectId, project) => saveProject(e, projectId, project));
  ipcMain.handle('project-list', () => listProjects());
  ipcMain.handle('project-remove-recent', (e, projectId) => removeRecentProjectById(projectId));
};

const setContentSecurityPolicy = () => {
  // Only set a CSP when in production mode, because setting it like this seems to break webpack's
  // hot-reloading and opening the chromium developer tools.
  if (!devMode) {
    logger.silly('Running in production mode; setting a default content security policy.');
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': ['script-src \'self\''],
        },
      });
    });
  } else {
    logger.warn('Running in development mode; not setting a default content security policy.');
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  setContentSecurityPolicy();
  registerIpcHandlers();
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// register default handlers on all created web contents
app.on('web-contents-created', (webContentsCreatedEvent, contents) => {
  contents.on('will-navigate', (willNavigateEvent, url) => {
    logger.warn(`preventing navigation to ${url}`);
    willNavigateEvent.preventDefault();
  });

  contents.on('new-window', (windowEvent, url) => {
    windowEvent.preventDefault();

    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      shell.openExternal(url);
    } else {
      logger.warn('preventing new window with non-standard protocol');
    }
  });
});
