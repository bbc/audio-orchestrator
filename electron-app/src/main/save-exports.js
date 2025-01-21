/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import path from 'path';
import fse from 'fs-extra';
import {
  dialog,
  app,
  shell,
  BrowserWindow,
} from 'electron';
import { electronLogger as logger } from '#logging';

export const openInFolder = (e, outputPath) => {
  shell.openPath(outputPath);
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

export const selectCustomTemplatePath = (e, defaultPath) => dialog.showOpenDialog(
  BrowserWindow.fromWebContents(e.sender),
  {
    title: 'Select template directory',
    message: 'Choose the directory that contains package.json, src, and dist.',
    properties: [
      'openDirectory',
    ],
    defaultPath,
  },
)
  .then(({ filePaths }) => {
    const filePath = filePaths[0];
    if (filePath === undefined) {
      return undefined;
    }

    const expectedContents = ['package.json', 'dist'];
    return fse.readdir(filePath).then((files) => {
      if (!expectedContents.every(name => files.includes(name))) {
        throw new Error('Expected files not present in custom template dir.');
      }
      return filePath;
    });
  });
