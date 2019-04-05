import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { fork } from 'child_process';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

// Start the server process
let apiUrl;
const apiProcess = fork(path.resolve(__dirname, 'api.js'), {});
const waitForApi = new Promise((resolve) => {
  apiProcess.on('message', (message) => {
    if (message.ready) {
      apiUrl = `http://${message.host}:${message.port}`;
      resolve();
    }
    if (message.error) {
      throw new Error('Failed to start API server');
    }
  });
});

// stop the server when the application exits
process.on('exit', apiProcess.kill);

// expose the API URL to the preload script as a synchronous ipc response
ipcMain.on('GET_API_URL', (event) => {
  /* eslint-disable-next-line no-param-reassign */
  event.returnValue = apiUrl;
});


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1024,
    height: 1200,
    webPreferences: {
      nodeIntegration: false,
      sandbox: false,
      contextIsolation: false,
      preload: path.resolve(__dirname, 'preload.js'),
    },
  });

  // install devTools
  if (process.env.NODE_ENV === 'development') {
    installExtension(REACT_DEVELOPER_TOOLS)
        .then(name => console.log(`Added Extension:  ${name}`))
        .catch(err => console.log('An error occurred: ', err));
    installExtension(REDUX_DEVTOOLS)
        .then(name => console.log(`Added Extension:  ${name}`))
        .catch(err => console.log('An error occurred: ', err));
  }

  if (process.env.NODE_ENV === 'development') {
    // load the user interface hosted by webpack-dev-server
    win.loadURL('http://localhost:8080');

    // Open the DevTools.
    win.webContents.openDevTools();
  } else {
    // load the webpack-generated user interface index.html
    win.loadFile('node_modules/bbcat-orchestration-builder-react-frontend/dist/index.html');

    // TODO: Disable DevTools when app is more stable.
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  waitForApi.then(createWindow);
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
