import uuidv4 from 'uuid/v4';
import Sequence from './Sequence';
import {
  PAGE_PROJECT_PRESENTATION,
  PAGE_PROJECT_EXPORT,
  PAGE_PROJECT_CONTROLS,
} from '../reducers/UIReducer';

const DEFAULT_BASE_URL = 'audio';

/**
 * Helper for validating URL in advanced project settings
 */
const isUrl = (str) => {
  try {
    /* eslint-disable-next-line no-unused-vars */
    const _ = new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Helper for validating cloud-sync hostname in advanced project settings
 */
const isHostname = str => isUrl(`wss://${str}`) && !str.includes('/') && !str.includes(':');

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

  /**
   * Updates the stored list of sequenceIds.
   *
   * @private
   */
  updateSequencesList() {
    const { store, sequencesList } = this;
    store.set('sequenceIds', sequencesList.map(({ sequenceId }) => sequenceId));
  }

  /**
   * Gets the project name.
   *
   * @returns {string}
   */
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
  get settings() {
    const { settings } = this.data;
    const { baseUrl } = settings;
    return {
      ...settings,
      baseUrl: baseUrl || DEFAULT_BASE_URL,
    };
  }

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

    this.updateSequencesList();

    return sequence;
  }

  /**
   * Deletes a sequence
   *
   * @param {string} sequenceId
   */
  deleteSequence(sequenceId) {
    const { data } = this;
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
    this.updateSequencesList();
  }

  /**
   * Deletes the entire project and all sequences within it
   */
  delete() {
    const { data, store } = this;
    const { sequences } = data;

    // delete all sequences
    Object.keys(sequences).forEach(sequenceId => this.deleteSequence(sequenceId));

    // delete project keys from the store
    store.delete('name');
    store.delete('lastOpened');
    store.delete('settings');
    store.delete('sequenceIds');

    // NOTE: to fully delete a project it needs to be removed from the ProjectStore and state, too.
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

  /**
   * Validates the presentation settings by checking that each text field has been filled in.
   *
   * @private
   */
  validatePresentationSettings() {
    const { data } = this;
    const { settings } = data;
    const {
      title,
      startLabel,
      introduction,
    } = settings;

    const valid = title && startLabel && introduction;

    return {
      key: 'presentation',
      title: 'Presentation Settings',
      message: valid ? null : 'Not all fields have been completed.',
      warning: !valid,
      error: false,
      projectPage: PAGE_PROJECT_PRESENTATION,
    };
  }

  /**
   * Validates the advanced project settings
   */
  validateAdvancedSettings() {
    const { data } = this;
    const { settings } = data;
    const {
      joiningLink,
      cloudSyncHostname,
    } = settings;
    const joiningLinkValid = !joiningLink || isUrl(joiningLink);
    const cloudSyncHostnameValid = !cloudSyncHostname || isHostname(cloudSyncHostname);
    const valid = joiningLinkValid && cloudSyncHostnameValid;

    let message = null;

    if (!joiningLinkValid) {
      message = 'Joining link is not a valid URL.';
    }

    if (!cloudSyncHostnameValid) {
      message = 'Cloud-Sync hostname is not a valid hostname.';
    }

    return {
      key: 'advanced',
      title: 'Advanced Settings',
      message,
      warning: false,
      error: !valid,
      projectPage: PAGE_PROJECT_EXPORT,
    };
  }

  /**
   * Validates the project's orchestration rules settings
   */
  validateRulesSettings() {
    const { data } = this;
    const { settings } = data;
    const { zones } = settings;

    const haveZones = (zones && zones.length > 0);
    const zonesValid = (zones || []).every(({ name, friendlyName }) => !!name && !!friendlyName);

    const warning = false;
    const error = !haveZones || !zonesValid;

    let message = null;

    if (!haveZones) {
      message = 'No device tags have been defined.';
    }

    if (!zonesValid && haveZones) {
      message = 'Not all tag definitions are valid.';
    }

    return {
      key: 'rules',
      title: 'Device Tags',
      message,
      warning,
      error,
      projectPage: PAGE_PROJECT_CONTROLS,
    };
  }

  /**
   * Validates the entire project, including settings and sequences. Returns a list of report items
   * for groups of settings and each sequence.
   *
   * @returns {Array<Object>}
   */
  validate() {
    const { data } = this;
    const { sequences } = data;

    return [
      this.validateRulesSettings(),
      this.validatePresentationSettings(),
      this.validateAdvancedSettings(),
      ...Object.keys(sequences).map(sequenceId => sequences[sequenceId].validate()),
    ];
  }
}

export default Project;
