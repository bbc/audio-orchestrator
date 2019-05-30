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
        isMain,
        isIntro,
      } = settings;

      return {
        sequenceId,
        name,
        isMain,
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
   * @param {boolean} [options.isMain] - whether the sequence is the main sequence
   * @param {boolean} [options.isIntro] - whether the sequence is the intro loop
   */
  addSequence({
    name = 'New Sequence',
    isMain = false,
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
    settings.isMain = isMain;
    settings.isIntro = isIntro;

    // Save the sequence object
    sequences[newSequenceId] = sequence;

    // Refresh the stored sequencesList, only storing the sequenceId.
    store.set('sequenceIds', this.sequencesList.map(({ sequenceId }) => sequenceId));
  }
}

export default Project;
