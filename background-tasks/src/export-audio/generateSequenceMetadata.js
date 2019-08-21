/**
 * Finds the duration of the sequence from that of the longest file referenced by an object.
 *
 * @returns {number}
 */
const findSequenceDuration = (objects, files) => {
  let duration = 0;

  objects.forEach(({ fileId }) => {
    const file = files[fileId];
    duration = Math.max(duration, file.probe.duration);
  });

  return duration;
};

/**
 * Generates the JSON structure to be written to a sequence.json file for the given sequence and
 * project settings objects.
 */
const generateSequenceMetatata = (sequence, settings, files) => {
  const {
    sequenceId,
    loop,
    outPoints,
    objects,
  } = sequence;

  const { baseUrl } = settings;

  const duration = findSequenceDuration(objects, files);

  return {
    duration,
    loop,
    outPoints,
    objects: objects.map(object => ({
      objectId: `${object.objectNumber}-${object.label}`,
      orchestration: {
        ...object.orchestration,
      },
      items: files[object.fileId].encodedItems.map(item => ({
        start: item.start,
        duration: item.duration,
        source: {
          channelMapping: object.channelMapping,
          type: item.type,
          url: `${baseUrl}/${sequenceId}/${item.relativePath}`,
          urlSafari: item.relativePathSafari ? `${baseUrl}/${sequenceId}/${item.relativePathSafari}` : null,
        },
      })),
    })),
  };
};

export default generateSequenceMetatata;
