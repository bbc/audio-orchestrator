import { electronLogger as logger } from 'bbcat-orchestration-builder-logging';
import path from 'path';
import os from 'os';
import {
  app,
  BrowserWindow,
  ipcMain,
} from 'electron';
import {
  openUrl,
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

// TODO - this setting becomes the default in Electron 9 and can be removed then
app.allowRendererProcessReuse = true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let creditsWin;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
      sandbox: false,
      contextIsolation: false,
      preload: path.resolve(__dirname, '../renderer/preload.js'),
    },
  });

  // install devTools
  if (process.env.NODE_ENV === 'development') {
    /* eslint-disable-next-line global-require */
    const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');
    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => logger.info(`Added Extension:  ${name}`))
      .catch(err => logger.warn('An error occurred: ', err));
    installExtension(REDUX_DEVTOOLS)
      .then(name => logger.info(`Added Extension:  ${name}`))
      .catch(err => logger.warn('An error occurred: ', err));
  }

  if (process.env.NODE_ENV === 'development') {
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
function createCreditsWindow() {
  if (creditsWin || !win) return;

  creditsWin = new BrowserWindow({
    width: 800,
    height: 600,
    parent: win,
  });

  creditsWin.loadFile('credits.html');

  creditsWin.on('closed', () => {
    creditsWin = null;
  });
}

const registerIpcHandlers = () => {
  // get working directories to log to browser console
  ipcMain.handle('get-working-directories', () => ({
    homedir: os.homedir(),
    cwd: process.cwd(),
  }));

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

  // Handlers for saving exports:
  ipcMain.handle('open-url', openUrl);
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
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
