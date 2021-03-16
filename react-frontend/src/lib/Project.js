import uuidv4 from 'uuid/v4';
import Sequence from './Sequence';
import Control from './Control';
import {
  PAGE_PROJECT_PRESENTATION,
  // PAGE_PROJECT_EXPORT,
} from '../reducers/UIReducer';

const DEFAULT_BASE_URL = 'audio';

const DEFAULT_SETTINGS = {
  title: 'Title',
  subtitle: 'Subtitle',
  introduction: 'Introduction',
  startLabel: 'Start new session',
  joinLabel: 'Join existing session',
  playerImageAltText: '',
  compressorRatio: 2,
  compressorThreshold: 0,
  fadeOutDuration: 0,
  accentColour: '#006def',
  enableDebugUI: true,
  enableTutorial: false,
  enableCalibration: false,
  cloudSyncHostname: 'cloudsync.virt.ch.bbc.co.uk',
};

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
const isHostname = str => str && isUrl(`wss://${str}`) && !str.includes('/') && !str.includes(':');

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
    // Get simple top level properties
    data.name = store.get('name', '');
    data.projectBasePath = store.get('projectBasePath', '');
    data.lastOpened = store.get('lastOpened', '');
    data.settings = store.get('settings', DEFAULT_SETTINGS);
    data.images = store.get('images', {});

    // get controls listed in controlIds
    data.controls = {};
    data.controlIds = store.get('controlIds', []);
    data.controlIds.forEach((controlId) => {
      data.controls[controlId] = new Control(store, controlId);
    });

    // get sequences listed in sequenceIds
    data.sequences = {};
    data.sequenceIds = store.get('sequenceIds', []);
    data.sequenceIds.forEach((sequenceId) => {
      data.sequences[sequenceId] = new Sequence(store, sequenceId);
    });
  }

  /**
   * Updates the stored list of sequenceIds.
   *
   * @private
   */
  updateSequencesList() {
    const { store, data } = this;
    store.set('sequenceIds', data.sequenceIds);
  }

  /**
   * Updates the stored list of controlIds.
   *
   * @private
   */
  updateControlsList() {
    const { data, store, controlsList } = this;

    data.controlIds = controlsList.map(({ controlId }) => controlId);
    store.set('controlIds', data.controlIds);
  }

  /**
   * Gets the project name.
   *
   * @returns {string}
   */
  get name() { return this.data.name; }

  /**
   * Gets the path to the directory where the project file is stored.
   *
   * @returns {string}
   */
  get projectBasePath() { return this.data.projectBasePath; }

  /**
   * Gets a sequences list, enumerating all sequenceIds and some basic sequence settings.
   *
   * @returns {Array<Object>}
   */
  get sequencesList() {
    return this.data.sequenceIds.map((sequenceId) => {
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
   * Gets a controls list, enumerating all controlIds and some basic sequence settings.
   *
   * @returns {Array<Object>}
   */
  get controlsList() {
    const { controlIds, controls } = this.data;

    // Remove any controls that have been deleted
    // Then get the extra data for the remaining controlIds
    return controlIds
      .filter(controlId => controlId in controls)
      .map((controlId) => {
        const { controlType, controlName } = this.controls[controlId];

        return {
          controlId,
          controlName,
          controlType,
        };
      });
  }

  /**
   * Swaps the position of the given controlIds in the list of controls
   *
   * @param {string} controlId
   * @param {string} otherControlId
   */
  swapControlOrder(controlId, otherControlId) {
    const { controlIds } = this.data;

    const index = controlIds.indexOf(controlId);
    const otherIndex = controlIds.indexOf(otherControlId);

    // Only update if both controlIds are found
    if (index > -1 && otherIndex > -1) {
      controlIds[index] = otherControlId;
      controlIds[otherIndex] = controlId;

      this.updateControlsList();
    }
  }

  /**
   * Swaps the position of the given sequenceId in the list of sequences
   *
   * @param {string} sequenceId
   * @param {string} otherSequenceId
   */
  swapSequenceOrder(sequenceId, otherSequenceId) {
    const { sequenceIds } = this.data;
    const index = sequenceIds.indexOf(sequenceId);
    const otherIndex = sequenceIds.indexOf(otherSequenceId);

    // Only update if both sequenceIds are found
    if (index > -1 && otherIndex > -1) {
      sequenceIds[index] = otherSequenceId;
      sequenceIds[otherIndex] = sequenceId;
      this.updateSequencesList();
    }
  }


  /**
   * Gets the sequences object, individual sequences are accessed using the sequenceId as the key.
   *
   * @returns {Object}
   */
  get sequences() { return this.data.sequences; }

  /**
   * Gets the controls object, individual controls are accessed using the controlId as the key.
   *
   * @returns {Object}
   */
  get controls() { return this.data.controls; }

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
   * Gets the project images as an object indexed by imageId.
   *
   * @returns {Object}
   */
  get images() {
    const { images } = this.data;
    return {
      ...images,
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
   * Replaces the project images object
   */
  set images(images) {
    const { store, data } = this;
    data.images = images;
    store.set('images', images);
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
    name = 'New sequence',
    isIntro = false,
  } = {}) {
    const { store, data } = this;
    const { sequences, sequenceIds } = data;

    // Generate a random UUID for the new sequence
    const newSequenceId = uuidv4();

    // Create the sequence object
    const sequence = new Sequence(store, newSequenceId);
    const { settings } = sequence;
    settings.name = name;
    settings.isIntro = isIntro;

    // Sequence setting defaults (the same for into and non-intro sequences)
    settings.loop = false;
    settings.skippable = false;
    settings.hold = true;

    // Defaults for having the settings open or closed
    settings.choicesOpen = false;
    settings.settingsOpen = false;

    // Save the sequence object
    sequences[newSequenceId] = sequence;
    data.sequenceIds = [...sequenceIds, newSequenceId];
    this.updateSequencesList();

    return sequence;
  }

  /**
   * Changes the project's intro sequence by setting the isIntro flag on one sequence and removing
   * it from all other sequences.
   * @param string initialSequenceId
   */
  setIntroSequence(initialSequenceId) {
    Object.keys(this.sequences).forEach((sequenceId) => {
      this.sequences[sequenceId].settings.isIntro = sequenceId === initialSequenceId;
    });
  }

  /**
   * Deletes a sequence
   *
   * @param {string} sequenceId
   */
  deleteSequence(sequenceId) {
    const { data } = this;
    const { sequences, sequenceIds } = data;

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
    data.sequenceIds = sequenceIds.filter(s => s !== sequenceId);
    this.updateSequencesList();
  }

  /**
   * Adds a control
   *
   * @param {string} controlName
   * @param {string} controlType
   */
  addControl({
    controlType,
    controlName,
    controlParameters,
    controlDefaultValues,
  }) {
    const { store, data } = this;
    const { controlIds, controls } = data;

    // Generate a random UUID for the new sequence
    const newControlId = uuidv4();

    // Create the control object
    const control = new Control(store, newControlId);

    // Populate the new control with the given initial properties
    control.controlType = controlType;
    control.controlName = controlName;
    control.controlParameters = controlParameters;
    control.controlDefaultValues = controlDefaultValues;

    // By default, the control is allowed on all sequences and all deviceTypes
    // Use an inverted condition to prohibit some sequences, so we don't need to list all sequences
    // here, and so that any new sequence is automatically allowed unless manually removed.
    control.controlBehaviours = [
      {
        behaviourId: uuidv4(),
        behaviourType: 'spread',
        behaviourParameters: {
          perDeviceGainAdjust: 1.0, // this has no effect for controls
        },
      },
      {
        behaviourId: uuidv4(),
        behaviourType: 'allowedIf',
        behaviourParameters: {
          conditions: [
            {
              conditionId: uuidv4(),
              property: 'device.deviceIsMain',
              operator: 'anyOf',
              value: ['true', 'false'],
            },
            {
              conditionId: uuidv4(),
              property: 'session.currentContentId',
              operator: 'anyOf',
              value: [],
              invertCondition: true,
            },
          ],
        },
      },
    ];

    // Save the control object and add it to the list of controls
    controls[newControlId] = control;
    controlIds.push(newControlId);
    this.updateControlsList();

    return control;
  }

  /**
   * Deletes a control
   *
   * @param {string} controlId
   */
  deleteControl(controlId) {
    const { data } = this;
    const { controls } = data;

    // if the control doesn't exist, silently move on.
    if (!(controlId in controls)) {
      return;
    }

    const control = controls[controlId];
    control.delete();
    delete controls[controlId];

    // also remove any object behaviours that rely on this control
    Object.values(this.sequences).forEach(sequence => sequence.handleDeleteControl(controlId));

    this.updateControlsList();
  }

  /**
   * Deletes the entire project and all sequences, controls, and images within it
   */
  delete() {
    const { data, store } = this;
    const { sequences, controls } = data;

    // delete all sequences
    Object.keys(sequences).forEach(sequenceId => this.deleteSequence(sequenceId));
    Object.keys(controls).forEach(controlId => this.deleteControl(controlId));

    // delete project keys from the store
    store.delete('name');
    store.delete('lastOpened');
    store.delete('settings');
    store.delete('images');
    store.delete('sequenceIds');
    store.delete('controlIds');

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
        return sequence.getExportData(this.controls);
      });
  }

  /**
   * Selects which controls to include in an export and returns them in the export format as a list
   * of plain objects.
   *
   * @return {Array<Object>}
   */
  getControlsToExport() {
    const { controlsList, controls } = this;

    return controlsList
      .map(({ controlId }) => {
        const control = controls[controlId];
        return control.getExportData();
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
      title: 'Appearance settings',
      message: valid ? null : 'Not all fields have been completed.',
      warning: !valid,
      error: false,
      projectPage: PAGE_PROJECT_PRESENTATION,
      editIcon: 'paint brush',
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
    const cloudSyncHostnameValid = isHostname(cloudSyncHostname);
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
      title: 'Advanced settings',
      message,
      warning: false,
      error: !valid,
      // projectPage: PAGE_PROJECT_EXPORT,
      editIcon: 'share',
    };
  }

  /**
   * Validates images by checking if any of them have error flags set
   */
  validateImages() {
    const { images } = this.data;
    const valid = Object.values(images).every(({ error }) => !error);

    const message = valid ? null : 'Image file is missing; the default will be used.';

    return {
      key: 'images',
      title: 'Image file',
      message,
      warning: !valid,
      error: false,
      projectPage: PAGE_PROJECT_PRESENTATION,
      editIcon: 'paint brush',
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
      this.validatePresentationSettings(),
      this.validateAdvancedSettings(),
      this.validateImages(),
      ...Object.keys(sequences).map(sequenceId => sequences[sequenceId].validate()),
    ];
    // TODO: Validate controls and object behaviours
  }
}

export default Project;
