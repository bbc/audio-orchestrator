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

const getAudioItems = (object, files, baseUrl, sequenceId) => {
  if (!files[object.fileId]) {
    return [];
  }

  return files[object.fileId].encodedItems.map(item => ({
    start: item.start,
    duration: item.duration,
    source: {
      channelMapping: object.channelMapping,
      panning: object.panning,
      type: item.type,
      url: `${baseUrl}/${sequenceId}/${item.relativePath}`,
      urlSafari: item.relativePathSafari ? `${baseUrl}/${sequenceId}/${item.relativePathSafari}` : null,
    },
  }));
};

const getImageEffectsItems = (object, imageUrls, imageAltTexts) => {
  const { objectNumber, objectBehaviours = [] } = object;
  const { behaviourParameters = {} } = objectBehaviours
    .find(b => b.behaviourType === 'imageEffects') || {};
  const { items = [] } = behaviourParameters;

  return items.map(({
    start, duration, imageId, effect,
  }) => ({
    start,
    duration,
    source: {
      type: 'image',
      src: imageUrls[imageId],
      // For now, use object number as proxy for priority; as priority cannot be edited for
      // individual items.
      priority: objectNumber,
      alt: imageAltTexts[imageId],
      effect,
    },
  })).filter(item => item.source.src !== undefined || item.source.effect !== undefined);
};

/**
 * Generates the JSON structure to be written to a sequence.json file for the given sequence and
 * project settings objects.
 *
 * @param {Object} sequence
 * @param {String} sequence.sequenceId,
 * @param {Boolean} [sequence.loop]
 * @param {Array<Number>} [sequence.outPoints]
 * @param {Array<Object>} [sequence.objects]
 * @param {Object} settings
 * @param {String} settings.baseUrl
 * @param {Object} files
 */
const generateSequenceMetadata = (
  {
    sequenceId,
    loop = false,
    outPoints = [],
    objects = [],
  } = {}, // sequence
  settings,
  files,
  imageUrls,
  imageAltTexts,
) => {
  const { baseUrl } = settings;

  const duration = findSequenceDuration(objects, files);

  return {
    duration,
    loop,
    outPoints,
    objects: objects.map(object => ({
      objectId: `${object.objectNumber}-${object.label}`,
      objectBehaviours: (object.objectBehaviours || [])
        .filter(behaviour => behaviour.behaviourType !== 'imageEffects'),
      items: [
        ...getAudioItems(object, files, baseUrl, sequenceId),
        ...getImageEffectsItems(object, imageUrls, imageAltTexts),
      ],
    })),
  };
};

export default generateSequenceMetadata;
