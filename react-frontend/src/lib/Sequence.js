/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import getExportObjectBehaviours from './getExportObjectBehaviours.js';
import SequenceSettings from './SequenceSettings.js';

import {
  PAGE_PROJECT_SEQUENCES,
} from '../reducers/UIReducer.js';

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

  /**
   * delete all data about this sequence from the store.
   */
  delete() {
    const { store, data, sequenceId } = this;
    const { settings } = data;
    settings.delete();
    delete data.settings;

    [
      `sequences.${sequenceId}.objectsList`,
      `sequences.${sequenceId}.objects`,
      `sequences.${sequenceId}.filesList`,
      `sequences.${sequenceId}.files`,
    ].forEach((key) => store.delete(key));
  }

  get filesList() { return this.data.filesList; }

  set filesList(filesList) {
    const { store, sequenceId, data } = this;
    data.filesList = filesList;
    store.set(`sequences.${sequenceId}.filesList`, filesList);
  }

  get files() { return this.data.files; }

  set files(files) {
    const { store, sequenceId, data } = this;
    data.files = files;
    store.set(`sequences.${sequenceId}.files`, files);
  }

  get objectsList() { return this.data.objectsList; }

  set objectsList(objectsList) {
    const { store, sequenceId, data } = this;
    data.objectsList = objectsList;
    store.set(`sequences.${sequenceId}.objectsList`, objectsList);
  }

  get objects() { return this.data.objects; }

  set objects(objects) {
    const { store, sequenceId, data } = this;
    data.objects = objects;
    store.set(`sequences.${sequenceId}.objects`, objects);
  }

  get settings() { return this.data.settings; }

  /**
   * return the sequence data required for exporting as a plain object, with all settings included
   * at the top level, a list of objects, and a files object.
   */
  getExportData(controls) {
    const {
      sequenceId,
      objectsList,
      objects,
      settings,
      files,
    } = this;

    return {
      sequenceId,
      objects: objectsList.map(({ objectNumber }) => {
        const object = objects[objectNumber];
        const exportBehaviours = getExportObjectBehaviours(object.objectBehaviours, controls);

        // Ignore channelMapping and set to 'stereo' if the object's file has two channels
        let { channelMapping } = object;
        const file = files[object.fileId];
        if (file && file.probe && file.probe.numChannels === 2) {
          channelMapping = 'stereo';
        }

        return {
          ...object,
          objectBehaviours: exportBehaviours,
          channelMapping,
        };
      }),
      ...settings.getExportData(),
    };
  }

  /**
   * Validate the sequence and its settings and return a review item object.
   *
   * @returns {Object}
   */
  validate() {
    const {
      sequenceId,
      objectsList,
      objects,
      filesList,
      files,
      settings,
    } = this;

    const {
      name,
      next,
    } = settings;

    let message = null;
    let error = false;
    let warning = false;
    let projectPage; // defaults to Object page for this sequence if not set
    let editIcon = 'file audio outline';

    const numFilesAdded = filesList.length;
    const numObjectsAdded = objectsList.length || 0;
    const allObjectsHaveFiles = objectsList
      .every(({ objectNumber }) => !!objects[objectNumber].fileId);
    const allFilesAreGood = filesList.every(({ fileId }) => !files[fileId].error);
    const choicesAreGood = next.every((choice) => !!choice.label && !!choice.sequenceId);

    if (numFilesAdded === 0) {
      message = 'No audio files have been added.';
      error = true;
    } else if (numObjectsAdded === 0) {
      message = 'No metadata file has been added.';
      error = true;
    } else if (!allObjectsHaveFiles) {
      message = 'Not all objects in the metadata have been matched to audio files.';
      error = true;
    } else if (!allFilesAreGood) {
      message = 'Some audio files have errors.';
      error = true;
    } else if (!choicesAreGood) {
      message = 'Not all destinations have a valid label and target sequence.';
      projectPage = PAGE_PROJECT_SEQUENCES;
      editIcon = 'code branch';
      error = true;
    }

    if (!error) {
      if (!next || next.length === 0) {
        message = 'No destinations have been added.';
        warning = true;
        projectPage = PAGE_PROJECT_SEQUENCES;
        editIcon = 'code branch';
      }
    }

    return {
      key: sequenceId,
      title: name,
      message,
      warning,
      error,
      sequenceId,
      projectPage,
      editIcon,
    };
  }

  handleDeleteControl(controlId) {
    const newObjects = {};

    this.objectsList.forEach(({ objectNumber }) => {
      const newObject = {
        ...this.objects[objectNumber],
      };

      newObject.objectBehaviours = newObject.objectBehaviours
        .filter(({ behaviourType }) => behaviourType !== `control:${controlId}`);

      newObjects[objectNumber] = newObject;
    });

    this.objects = newObjects;
  }
}

export default Sequence;
