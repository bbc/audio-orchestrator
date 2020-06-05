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
