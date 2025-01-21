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

const waitForEncoding = (args, onProgress) => {
  const { sequences, fileStore } = args;
  // Find the fileIds to be encoded and store a reference to their AudioFile object so we can
  // later get their probe and encodedItems details for creating the sequence metadata.
  const files = {};
  const requiredFiles = [];
  sequences.forEach(({ objects }) => {
    objects.forEach(({ fileId }) => {
      files[fileId] = fileStore.getFile(fileId);
      requiredFiles.push({ fileId });
    });
  });

  return fileStore.encodeFiles(requiredFiles, onProgress)
    .then(({ result }) => {
      const filesWithErrors = result.filter(r => r.success === false);
      if (filesWithErrors.length > 0) {
        throw new Error(`${filesWithErrors.length} audio file${filesWithErrors.length > 1 ? 's' : ''} could not be encoded. (${filesWithErrors[0].error})`);
      }
    })
    .then(() => ({ ...args, files }));
};

export default waitForEncoding;
