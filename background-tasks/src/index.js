/**
 * This module exports an object of functions each taking a single arguments object and returning a
 * promise that resolves to a response object.
 */

import TaskManager from './taskManager';

import checkFilesExist from './check-files-exist';
import probeFiles from './probe-files';
import detectItems from './detect-items';
import encodeFiles from './encode-files';
import exportAudio from './export-audio';
import exportTemplate from './export-template';
import exportPreview from './export-preview';
import exportDistribution from './export-distribution';

const manager = new TaskManager();

export default {
  // Analyse task actions
  checkFilesExist: args => manager.createTask(checkFilesExist, args),
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
