import { createServer } from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { electronLogger as logger } from 'bbcat-orchestration-builder-logging';
import backgroundTasks from 'bbcat-orchestration-builder-background-tasks';

/**
 * A server process combining all the API calls tobe available locally.
 */

// Create the top level application
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

// Allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Accept, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  next();
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
app.post('/analyse/create', (req, res, next) => {
  backgroundTasks.checkFilesExist({ files: req.body.files })
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
app.post('/analyse/probe', (req, res, next) => {
  backgroundTasks.probeFiles({ fileIds: req.body.fileIds })
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
app.post('/analyse/items', (req, res, next) => {
  backgroundTasks.detectItems({ fileIds: req.body.fileIds })
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
app.post('/analyse/encode', (req, res, next) => {
  const { files, baseUrl } = req.body;
  backgroundTasks.encodeFiles({ files, baseUrl })
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
app.post('/export/audio', (req, res, next) => {
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
app.post('/export/template', (req, res, next) => {
  const { sequences, settings } = req.body;
  backgroundTasks.exportTemplate({ sequences, settings })
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
 * (public path etc.) changed appropriately.
 *
 * Expects the body to contain the sequences and settings objects as for /template.
 *
 * Creates a task that can be polled for progress using /task/<taskId>.
 */
app.post('/export/distribution', (req, res, next) => {
  const { sequences, settings } = req.body;
  backgroundTasks.exportDistribution({ sequences, settings })
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
app.post('/export/preview', (req, res, next) => {
  const { sequences, settings } = req.body;
  backgroundTasks.exportPreview({ sequences, settings })
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
app.get('/task/:taskId', (req, res, next) => {
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
app.delete('/task/:taskId', (req, res, next) => {
  const { taskId } = req.params;
  backgroundTasks.cancelTask({ taskId })
    .then(() => {
      res.json({
        success: true,
      });
    })
    .catch(err => next(err));
});

// Error handler defined last -----------------------------
app.use((err, req, res, next) => {
  logger.error(err);
  if (res.headersSent) {
    next(err);
  } else {
    res.status(500);
    res.json({ success: false });
  }
});

// create and start a server, using a random free TCP port by setting port to 0.
const host = '127.0.0.1';

const server = createServer(app);
server.listen(0, host, () => {
  const { port } = server.address();
  logger.info(`API listening on ${host}:${port}`);

  process.send({
    ready: true,
    host,
    port,
  });
});
