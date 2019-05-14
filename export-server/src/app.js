import express from 'express';
import bodyParser from 'body-parser';
import Exporter from './exporter';

const exporter = new Exporter();

const app = express();
app.use(bodyParser.json());

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
app.post('/audio', (req, res, next) => {
  exporter.exportAudio(req.body.sequences)
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
app.post('/template', (req, res, next) => {
  exporter.exportTemplate(req.body.sequences, req.body.settings)
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
app.post('/distribution', (req, res, next) => {
  exporter.exportDistribution(req.body.sequences, req.body.settings)
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
app.post('/preview', (req, res, next) => {
  exporter.exportPreview(req.body.sequences, req.body.settings)
    .then(({ taskId }) => {
      res.json({
        success: true,
        taskId,
      });
    })
    .catch(err => next(err));
});

/**
 * Poll the status of the given task, returning progress or an error flag.
 */
app.get('/task/:taskId', (req, res, next) => {
  exporter.getTask(req.params.taskId)
    .then(({
      error,
      currentStep,
      completed,
      total,
      result,
    }) => {
      res.json({
        success: true,
        error,
        currentStep,
        completed,
        total,
        result,
      });
    })
    .catch(err => next(err));
});

/**
 * Cancel the given task and delete any output files created by it.
 */
app.delete('/task/:taskId', (req, res, next) => {
  exporter.deleteTask(req.params.taskId)
    .then(() => {
      res.json({
        success: true,
      });
    })
    .catch(err => next(err));
});

export default app;
