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

export default class SequenceSettings {
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
      instructions,
      next,
      choicesOpen,
      settingsOpen,
    } = store.get(`sequences.${sequenceId}.settings`, {});

    data.name = name || '';
    data.isIntro = !!isIntro;
    data.loop = !!loop;
    data.outPoints = outPoints || [];
    data.hold = !!hold;
    data.skippable = !!skippable;
    data.instructions = !!instructions;
    data.next = next || [];
    data.choicesOpen = choicesOpen || false;
    data.settingsOpen = settingsOpen || false;
  }

  saveToStore() {
    const { store, data, sequenceId } = this;

    store.set(`sequences.${sequenceId}.settings`, data);
  }

  delete() {
    const { store, sequenceId } = this;
    store.delete(`sequences.${sequenceId}.settings`);
  }

  get name() { return this.data.name; }

  set name(name) {
    const { data } = this;
    data.name = name;
    this.saveToStore();
  }

  get isIntro() { return this.data.isIntro; }

  set isIntro(isIntro) {
    const { data } = this;
    data.isIntro = isIntro;
    this.saveToStore();
  }

  get loop() { return this.data.loop; }

  set loop(loop) {
    const { data } = this;
    data.loop = loop;
    this.saveToStore();
  }

  get outPoints() { return this.data.outPoints; }

  set outPoints(outPoints) {
    const { data } = this;
    data.outPoints = outPoints;
    this.saveToStore();
  }

  get hold() { return this.data.hold; }

  set hold(hold) {
    const { data } = this;
    data.hold = hold;
    this.saveToStore();
  }

  get skippable() { return this.data.skippable; }

  set skippable(skippable) {
    const { data } = this;
    data.skippable = skippable;
    this.saveToStore();
  }

  get instructions() { return this.data.instructions; }

  set instructions(instructions) {
    const { data } = this;
    data.instructions = instructions;
    this.saveToStore();
  }

  get next() { return this.data.next; }

  set next(next) {
    const { data } = this;
    data.next = next;
    this.saveToStore();
  }

  get choicesOpen() { return this.data.choicesOpen; }

  set choicesOpen(choicesOpen) {
    const { data } = this;
    data.choicesOpen = choicesOpen;
    this.saveToStore();
  }

  get settingsOpen() { return this.data.settingsOpen; }

  set settingsOpen(settingsOpen) {
    const { data } = this;
    data.settingsOpen = settingsOpen;
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
      instructions,
      next,
      choicesOpen,
      settingsOpen,
    } = this;

    return {
      name,
      isIntro,
      loop,
      outPoints,
      hold,
      skippable,
      instructions,
      next,
      choicesOpen,
      settingsOpen,
    };
  }
}
