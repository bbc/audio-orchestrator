import uuidv4 from 'uuid/v4';
import Sequence from './Sequence';

/**
 * Class representing an open project.
 */
class Project {
  /**
   * @param {ProjectStore} store
   */
  constructor(store) {
    this.data = {};
    this.store = store;
    this.loadFromStore();
  }

  /**
   * Populates this object by loading all information from the persistent backing store.
   *
   * @private
   */
  loadFromStore() {
    const { store, data } = this;
    data.name = store.get('name', '');
    data.lastOpened = store.get('lastOpened', '');
    data.settings = store.get('settings', {});
    data.sequences = {};
    store.get('sequenceIds', []).forEach((sequenceId) => {
      data.sequences[sequenceId] = new Sequence(store, sequenceId);
    });
  }

  get name() { return this.data.name; }

  /**
   * Gets a sequences list, enumerating all sequenceIds and some basic sequence settings.
   *
   * @returns {Array<Object>}
   */
  get sequencesList() {
    return Object.keys(this.sequences).map((sequenceId) => {
      const { settings } = this.sequences[sequenceId];
      const {
        name,
        isIntro,
      } = settings;

      return {
        sequenceId,
        name,
        isIntro,
      };
    });
  }

  /**
   * Gets the sequences object, individual sequences are accessed using the sequenceId as the key.
   *
   * @returns {Object}
   */
  get sequences() { return this.data.sequences; }

  /**
   * Gets the project settings.
   *
   * @returns {Object}
   */
  get settings() { return this.data.settings; }

  /**
   * Changes the project name.
   *
   * @param {string} name
   */
  set name(name) {
    const { store, data } = this;
    data.name = name;
    store.set('name', name);
  }

  /**
   * Replaces the project settings object.
   * @param {Object} settings
   */
  set settings(settings) {
    const { store, data } = this;
    data.settings = settings;
    store.set('settings', settings);
  }

  /**
   * Creates a new sequence.
   *
   * @param {Object} [options] - initial sequence settings
   * @param {string} [options.name] - sequence name
   * @param {boolean} [options.isIntro] - whether the sequence is the intro loop
   *
   * @returns {Sequence} - the newly created sequence object
   */
  addSequence({
    name = 'New Sequence',
    isIntro = false,
  } = {}) {
    const { store, data } = this;
    const { sequences } = data;

    // Generate a random UUID for the new sequence
    const newSequenceId = uuidv4();

    // Create the sequence object
    const sequence = new Sequence(store, newSequenceId);
    const { settings } = sequence;
    settings.name = name;
    settings.isIntro = isIntro;

    if (isIntro) {
      settings.loop = true;
      settings.skippable = true;
      settings.hold = false;
    } else {
      settings.loop = false;
      settings.skippable = false;
      settings.hold = true;
    }

    // Save the sequence object
    sequences[newSequenceId] = sequence;

    // Refresh the stored sequencesList, only storing the sequenceId.
    store.set('sequenceIds', this.sequencesList.map(({ sequenceId }) => sequenceId));

    return sequence;
  }

  /**
   * Deletes a sequence
   *
   * @param {string} sequenceId
   */
  deleteSequence(sequenceId) {
    const { data, store } = this;
    const { sequences } = data;

    // if the sequence doesn't exist, silently move on.
    if (!(sequenceId in sequences)) {
      return;
    }

    // remove links to the deleted sequence from other sequences
    Object.keys(sequences).forEach((k) => {
      const sequence = sequences[k];
      const { next } = sequence.settings;
      if (next.some(choice => choice.sequenceId === sequenceId)) {
        sequence.settings.next = next.filter(choice => choice.sequenceId !== sequenceId);
      }
    });

    // delete the sequence itself
    const sequence = sequences[sequenceId];
    sequence.delete();
    delete sequences[sequenceId];

    // Refresh the stored sequencesList, only storing the sequenceId.
    store.set('sequenceIds', this.sequencesList.map(({ sequenceId }) => sequenceId));
  }

  /**
   * Selects which sequences to include in an export, and returns them in the export format as
   * a list of plain objects.
   *
   * @return {Array<Object>}
   */
  getSequencesToExport() {
    const { sequencesList } = this;
    return sequencesList
      .filter(({ sequenceId }) => {
        // include all sequences that have objects (so have either audio files or metadata).
        const { objectsList } = this.sequences[sequenceId] || [];
        return objectsList.length > 0;
      })
      .map(({ sequenceId }) => {
        const sequence = this.sequences[sequenceId];
        return sequence.getExportData();
      });
  }
}

export default Project;
