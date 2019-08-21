/**
 * This module exports an object of functions each taking a single arguments object and returning a
 * promise that resolves to a response object.
 */

import TaskManager from './taskManager';
import {
  FileStore,
  registerFiles,
  probeFiles,
  detectItems,
  encodeFiles,
} from './files';

import exportAudio from './export-audio';
import exportTemplate from './export-template';
import exportPreview from './export-preview';
import exportDistribution from './export-distribution';

const fileStore = new FileStore();
const manager = new TaskManager(fileStore);


export default {
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

  // meta task actions
  getTask: ({ taskId }) => manager.getTask(taskId),
  cancelTask: ({ taskId }) => manager.cancelTask(taskId),
};
