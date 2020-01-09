/**
 * Class representing a control.
 */
class Control {
  constructor(store, controlId) {
    this.data = {};
    this.store = store;
    this.controlId = controlId;

    this.loadFromStore();
  }

  /**
   * Refreshes the control object by loading all its settings from the backing store.
   */
  loadFromStore() {
    const { store, controlId, data } = this;

    // TODO: for now, assume that we can store all control properties in a top level key;
    // replacing the entire control when any property changes
    const {
      controlName = '',
      controlType = '',
      controlDefaultValues = [],
      controlParameters = {},
      controlBehaviours = [],
    } = store.get(`controls.${controlId}`, {});

    data.controlName = controlName;
    data.controlType = controlType;
    data.controlDefaultValues = controlDefaultValues;
    data.controlParameters = controlParameters;
    data.controlBehaviours = controlBehaviours;
  }

  /**
   * delete all data about this control from the store.
   */
  delete() {
    const { store, controlId } = this;
    store.delete(`controls.${controlId}`);
  }

  get controlName() { return this.data.controlName; }

  get controlType() { return this.data.controlType; }

  get controlDefaultValues() { return this.data.controlDefaultValues; }

  get controlParameters() { return this.data.controlParameters; }

  get controlBehaviours() { return this.data.controlBehaviours; }

  set controlName(controlName) {
    const { store, controlId, data } = this;
    data.controlName = controlName;
    store.set(`controls.${controlId}`, data);
  }

  set controlType(controlType) {
    const { store, controlId, data } = this;
    data.controlType = controlType;
    store.set(`controls.${controlId}`, data);
  }

  set controlDefaultValues(controlDefaultValues) {
    const { store, controlId, data } = this;
    data.controlDefaultValues = controlDefaultValues;
    store.set(`controls.${controlId}`, data);
  }

  set controlParameters(controlParameters) {
    const { store, controlId, data } = this;
    data.controlParameters = controlParameters;
    store.set(`controls.${controlId}`, data);
  }

  set controlBehaviours(controlBehaviours) {
    const { store, controlId, data } = this;
    data.controlBehaviours = controlBehaviours;
    store.set(`controls.${controlId}`, data);
  }

  /**
   * return the control data required for exporting as a plain object.
   */
  getExportData() {
    const {
      controlId,
      controlName,
      controlType,
      controlDefaultValues,
      controlParameters,
      controlBehaviours,
    } = this;

    return {
      controlId,
      controlName,
      controlType,
      controlDefaultValues,
      controlParameters, // TODO: remove parameterId?
      controlBehaviours, // TODO: remove behaviourId?
    };
  }

  /**
   * Validate the control review item object.
   *
   * @returns {Object}
   */
  validate() {
    // TODO: validate control
    // TODO: validate behaviour parameters against other controls and sequences, like in objects
    const {
      controlId,
      controlName,
    } = this;

    const message = null;
    const error = false;
    const warning = false;

    return {
      key: controlId,
      title: controlName,
      message,
      warning,
      error,
      controlId,
    };
  }
}

export default Control;
