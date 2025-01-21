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
*//**
 * This module exports an object of functions each taking a single arguments object and returning a
 * promise that resolves to a response object.
 */

import TaskManager from './taskManager.js';
import checkRequirements from './check-requirements/index.js';
import {
  FileStore,
  registerFiles,
  probeFiles,
  detectItems,
  encodeFiles,
} from './files/index.js';

import exportAudio from './export-audio/index.js';
import exportTemplate from './export-template/index.js';
import exportPreview from './export-preview/index.js';
import exportDistribution from './export-distribution/index.js';

import { addSearchPath } from './which.js';

const fileStore = new FileStore();
const manager = new TaskManager(fileStore);

export default {
  // General actions
  checkRequirements: args => manager.createTask(checkRequirements, args),

  // Analyse task actions
  registerFiles: args => manager.createTask(registerFiles, args),
  probeFiles: args => manager.createTask(probeFiles, args),
  detectItems: args => manager.createTask(detectItems, args),
  encodeFiles: args => manager.createTask(encodeFiles, args),

  // Export task actions
  exportAudio: args => manager.createTask(exportAudio, args),
  exportTemplate: args => manager.createTask(exportTemplate, args),
  exportDistribution: args => manager.createTask(exportDistribution, args),
  exportPreview: args => manager.createTask(exportPreview, args),

  // Meta task actions
  getTask: ({ taskId }) => manager.getTask(taskId),
  cancelTask: ({ taskId }) => manager.cancelTask(taskId),

  // configuration for binary lookup; must be called before first use of which().
  addSearchPath,
};
