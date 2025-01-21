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

import backgroundTasks from '#background-tasks';
import Router from './Router.js';

// Register the 'routes' - the Router implemented here doesn't support everything an express app
// does, but the format was mostly kept to allow easy porting between the two systems.
// Notably, calling next() is always treated as an error because the concept of middleware is not
// implemented, and calling res.json() does not actually encode the result as JSON, but does
// immediately return a response.
const backgroundTasksRouter = new Router();

backgroundTasksRouter.registerPost('/check-requirements', (req, res, next) => {
  backgroundTasks.checkRequirements()
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

// Analyser routes ----------------------------------------
/**
 * Create a number of file objects from { fileId, path } and check that the files exist.
 *
 * Expects a request body of { files: [{ fileId, path }] }
 *
 * Respond with a task id that can be used to poll progress and results. The fileId is used
 * to trigger further operations on the files, as a file must be created before it can be used.
 */
backgroundTasksRouter.registerPost('/analyse/create', (req, res, next) => {
  backgroundTasks.registerFiles({ files: req.body.files })
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

/**
 * Probe a number of (previously created) files by fileId for their audio streams.
 *
 * Expects a request body of { fileIds: [] }
 *
 * Respond with a task id that can be used to poll progress and results.
 */
backgroundTasksRouter.registerPost('/analyse/probe', (req, res, next) => {
  backgroundTasks.probeFiles({ files: req.body.files })
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

/**
 * Analyse a number of (previously created) files by fileId for their silent sections.
 *
 * Expects a request body of { fileIds: [] }
 *
 * Respond with a task id that can be used to poll progress and results.
 */
backgroundTasksRouter.registerPost('/analyse/items', (req, res, next) => {
  backgroundTasks.detectItems({ files: req.body.files })
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

/**
 * Encode a number of (previously created) files by fileId.
 *
 * Expects a request body of { files: [ { fileId, items, sequenceId } ] }
 *
 * Respond with a task id that can be used to poll progress and results.
 */
backgroundTasksRouter.registerPost('/analyse/encode', (req, res, next) => {
  backgroundTasks.encodeFiles({ files: req.body.files })
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

// Export routes ------------------------------------------
/**
 * Checks that all referenced encoded files exist, copies them into one temporary folder, and
 * generates the sequence metadata files. Returns the path to the combined directory, and the
 * names of the metadata files.
 *
 * Expects the body to contain an array of sequence objects, including objects, files, and
 * encodedItems for all files.
 *
 * Creates a task that can be polled for progress using /task/<taskId>.
 */
backgroundTasksRouter.registerPost('/export/audio', (req, res, next) => {
  const { sequences, settings } = req.body;
  backgroundTasks.exportAudio({ sequences, settings })
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

/**
 * Calls on the audio export to create the metadata and audio files and audio
 * to include. Returns the path to the source directory.
 *
 * Expects the body to contain the sequences object as for /audio, as well as the project settings.
 *
 * Creates a task that can be polled for progress using /task/<taskId>.
 */
backgroundTasksRouter.registerPost('/export/template', (req, res, next) => {
  const {
    sequences, controls, settings, images,
  } = req.body;
  backgroundTasks.exportTemplate({
    sequences, controls, settings, images,
  })
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

/**
 * Calls on the audio and template exports to create the metadata, audio, and source files.
 * Links node_modules and runs web pack to build a final distribution. Returns the path to the
 * dist directory.
 *
 * This same task should be used to prepare the distribution for the preview, with the settings
 * (public path etc.) changed backgroundTasksRouterropriately.
 *
 * Expects the body to contain the sequences and settings objects as for /template.
 *
 * Creates a task that can be polled for progress using /task/<taskId>.
 */
backgroundTasksRouter.registerPost('/export/distribution', (req, res, next) => {
  const {
    sequences, controls, settings, images,
  } = req.body;
  backgroundTasks.exportDistribution({
    sequences, controls, settings, images,
  })
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

/**
 * Starts a preview server after running the distribution task. Cancelling the task stops the
 * server.
 */
backgroundTasksRouter.registerPost('/export/preview', (req, res, next) => {
  const {
    sequences, controls, settings, images,
  } = req.body;
  backgroundTasks.exportPreview({
    sequences, controls, settings, images,
  })
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

// Generic task management ------------------------
/**
 * Poll the status of the given task, returning progress, error, and result data if set.
 */
backgroundTasksRouter.registerGet('/task/:taskId', (req, res, next) => {
  const { taskId } = req.params;
  backgroundTasks.getTask({ taskId })
    .then(({
      error,
      result,
      currentStep,
      completed,
      total,
    }) => {
      res.json({
        success: true,
        error,
        result,
        currentStep,
        completed,
        total,
      });
    })
    .catch(err => next(err));
});

/**
 * Cancel the given task and delete any output files created by it.
 */
backgroundTasksRouter.registerDelete('/task/:taskId', (req, res, next) => {
  const { taskId } = req.params;
  backgroundTasks.cancelTask({ taskId })
    .then(() => {
      res.json({
        success: true,
      });
    })
    .catch(err => next(err));
});

export default backgroundTasksRouter;
