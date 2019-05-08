import path from 'path';
import fse from 'fs-extra';
import { remote } from 'electron';

const {
  dialog,
  getCurrentWindow,
  app,
  shell,
} = remote;

export const openInFolder = (outputPath) => {
  shell.showItemInFolder(outputPath);
};

export const saveExportToDownloads = (exportDir) => {
  const dest = path.join(app.getPath('downloads'), path.basename(exportDir));
  return fse.move(exportDir, dest)
    .catch((err) => {
      console.log(`failed to move ${exportDir} to ${dest}.`, err);
      throw err;
    });
};

export const saveExportAs = (exportDir) => {
  const defaultDest = path.join(app.getPath('documents'), path.basename(exportDir));
  return new Promise((resolve, reject) => {
    dialog.showSaveDialog(
      getCurrentWindow(),
      {
        title: 'Save export as...',
        defaultPath: defaultDest,
      }, (fileName) => {
        // Make sure the user actually selected a file.
        if (fileName === undefined) {
          reject(new Error('No file selected.'));
          return;
        }

        resolve(fileName);
      },
    );
  })
    .then(dest => fse.move(exportDir, dest).then(() => dest))
    .catch((err) => {
      console.log(`failed to move ${exportDir} to selected destination`, err);
      throw err;
    });
};
