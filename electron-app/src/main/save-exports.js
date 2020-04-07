import { electronLogger as logger } from 'bbcat-orchestration-builder-logging';
import path from 'path';
import fse from 'fs-extra';
import {
  dialog,
  app,
  shell,
  BrowserWindow,
} from 'electron';

export const openUrl = (e, url) => {
  shell.openExternal(url);
};

export const openInFolder = (e, outputPath) => {
  shell.showItemInFolder(outputPath);
};

export const saveExportToDownloads = (e, exportDir) => {
  const dest = path.join(app.getPath('downloads'), path.basename(exportDir));
  return fse.move(exportDir, dest)
    .catch((err) => {
      logger.error(`failed to move ${exportDir} to ${dest}.`, err);
      throw err;
    });
};

export const saveExportAs = (e, exportDir) => {
  const defaultDest = path.join(app.getPath('documents'), path.basename(exportDir));

  return dialog.showSaveDialog(
    BrowserWindow.fromWebContents(e.sender),
    {
      title: 'Save export as...',
      defaultPath: defaultDest,
    },
  )
    .then(({ filePath }) => {
      // Make sure the user actually selected a file.
      if (filePath === undefined) {
        throw new Error('No file selected.');
      }

      return filePath;
    })
    .then(dest => fse.move(exportDir, dest).then(() => dest))
    .catch((err) => {
      logger.error(`failed to move ${exportDir} to selected destination`, err);
      throw err;
    });
};
