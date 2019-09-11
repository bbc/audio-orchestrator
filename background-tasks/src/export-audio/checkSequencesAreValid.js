const checkSequencesAreValid = (args) => {
  const { sequences } = args;
  sequences.forEach((sequence) => {
    if (!sequence.objects || sequence.objects.length === 0) {
      throw new Error('Not all sequences have objects.');
    }
  });

  sequences.forEach((sequence) => {
    sequence.objects.forEach((object) => {
      if (!object.fileId) {
        throw new Error('Not all objects have an audio file.');
      }
    });
  });

  return args;
};

export default checkSequencesAreValid;
