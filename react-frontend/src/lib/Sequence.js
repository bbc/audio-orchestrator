class SequenceSettings {
  constructor(store, sequenceId) {
    this.data = {};
    this.store = store;
    this.sequenceId = sequenceId;

    this.loadFromStore();
  }

  loadFromStore() {
    const { store, data, sequenceId } = this;
    const {
      name,
      isIntro,
      loop,
      outPoints,
      hold,
      skippable,
      next,
    } = store.get(`sequences.${sequenceId}.settings`, {});

    data.name = name || '';
    data.isIntro = !!isIntro;
    data.loop = !!loop;
    data.outPoints = outPoints || [];
    data.hold = !!hold;
    data.skippable = !!skippable;
    data.next = next || [];
  }

  saveToStore() {
    const { store, data, sequenceId } = this;

    store.set(`sequences.${sequenceId}.settings`, data);
  }

  get name() { return this.data.name; }

  get isIntro() { return this.data.isIntro; }

  get loop() { return this.data.loop; }

  get outPoints() { return this.data.outPoints; }

  get hold() { return this.data.hold; }

  get skippable() { return this.data.skippable; }

  get next() { return this.data.next; }

  set name(name) {
    const { data } = this;
    data.name = name;
    this.saveToStore();
  }

  set isIntro(isIntro) {
    const { data } = this;
    data.isIntro = isIntro;
    this.saveToStore();
  }

  set loop(loop) {
    const { data } = this;
    data.loop = loop;
    this.saveToStore();
  }

  set outPoints(outPoints) {
    const { data } = this;
    data.outPoints = outPoints;
    this.saveToStore();
  }

  set hold(hold) {
    const { data } = this;
    data.hold = hold;
    this.saveToStore();
  }

  set skippable(skippable) {
    const { data } = this;
    data.skippable = skippable;
    this.saveToStore();
  }

  set next(next) {
    const { data } = this;
    data.next = next;
    this.saveToStore();
  }

  /**
   * return the sequence settings required for exporting as a plain object.
   */
  getExportData() {
    const {
      name,
      isIntro,
      loop,
      outPoints,
      hold,
      skippable,
      next,
    } = this;

    return {
      name,
      isIntro,
      loop,
      outPoints,
      hold,
      skippable,
      next,
    };
  }
}

/**
 * Class representing a sequence.
 */
class Sequence {
  constructor(store, sequenceId) {
    this.data = {};
    this.store = store;
    this.sequenceId = sequenceId;

    this.loadFromStore();
  }

  /**
   * Refreshes the sequence object by loading all its contents from the backing store.
   */
  loadFromStore() {
    const { store, sequenceId, data } = this;

    data.objectsList = store.get(`sequences.${sequenceId}.objectsList`, []);
    data.objects = store.get(`sequences.${sequenceId}.objects`, {});

    data.filesList = store.get(`sequences.${sequenceId}.filesList`, []);
    data.files = store.get(`sequences.${sequenceId}.files`, {});

    data.settings = new SequenceSettings(store, sequenceId);
  }

  get filesList() { return this.data.filesList; }

  get files() { return this.data.files; }

  get objectsList() { return this.data.objectsList; }

  get objects() { return this.data.objects; }

  get settings() { return this.data.settings; }

  set filesList(filesList) {
    const { store, sequenceId, data } = this;
    data.filesList = filesList;
    store.set(`sequences.${sequenceId}.filesList`, filesList);
  }

  set files(files) {
    const { store, sequenceId, data } = this;
    data.files = files;
    store.set(`sequences.${sequenceId}.files`, files);
  }

  set objectsList(objectsList) {
    const { store, sequenceId, data } = this;
    data.objectsList = objectsList;
    store.set(`sequences.${sequenceId}.objectsList`, objectsList);
  }

  set objects(objects) {
    const { store, sequenceId, data } = this;
    data.objects = objects;
    store.set(`sequences.${sequenceId}.objects`, objects);
  }

  /**
   * return the sequence data required for exporting as a plain object, with all settings included
   * at the top level, a list of objects, and a files object.
   */
  getExportData() {
    const {
      sequenceId,
      objectsList,
      objects,
      files,
      settings,
    } = this;

    return {
      sequenceId,
      files,
      objects: objectsList.map(({ objectNumber }) => objects[objectNumber]),
      ...settings.getExportData(),
    };
  }
}

export default Sequence;
