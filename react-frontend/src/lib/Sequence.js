class SequenceSettings {
  constructor(store, sequenceId) {
    this.data = {};
    this.store = store;
    this.sequenceId = sequenceId;

    this.loadFromStore();
  }

  loadFromStore() {
    const { store, data, sequenceId } = this;
    const { name, isMain, isIntro } = store.get(`sequences.${sequenceId}.settings`, {});

    data.name = name || '';
    data.isMain = !!isMain;
    data.isIntro = !!isIntro;
  }

  saveToStore() {
    const { store, data, sequenceId } = this;

    store.set(`sequences.${sequenceId}.settings`, data);
  }

  get name() { return this.data.name; }

  get isMain() { return this.data.isMain; }

  get isIntro() { return this.data.isIntro; }

  set name(name) {
    const { data } = this;
    data.name = name;
    this.saveToStore();
  }

  set isMain(isMain) {
    const { data } = this;
    data.isMain = isMain;
    this.saveToStore();
  }

  set isIntro(isIntro) {
    const { data } = this;
    data.isIntro = isIntro;
    this.saveToStore();
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
}

export default Sequence;
