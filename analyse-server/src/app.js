import express from 'express';
import bodyParser from 'body-parser';
import Analyser from './analyse';

const analyser = new Analyser();

const app = express();
app.use(bodyParser.json());


/**
 * Create a number of file objects from { fileId, path } and check that the files exist.
 *
 * Expects a request body of { files: [{ fileId, path }] }
 *
 * Respond with a batch id that can be used to poll progress and results. The fileId is used
 * to trigger further operations on the files, as a file must be created before it can be used.
 */
app.post('/create', (req, res, next) => {
  analyser.batchCreate(req.body.files)
    .then(({ batchId }) => {
      res.json({
        success: true,
        batchId,
      });
    })
    .catch(err => next(err));
});

/**
 * Probe a number of (previously created) files by fileId for their audio streams.
 *
 * Expects a request body of { fileIds: [] }
 *
 * Respond with a batch id that can be used to poll progress and results.
 */
app.post('/probe', (req, res, next) => {
  analyser.batchProbe(req.body.fileIds)
    .then(({ batchId }) => {
      res.json({
        success: true,
        batchId,
      });
    })
    .catch(err => next(err));
});

/**
 * Analyse a number of (previously created) files by fileId for their silent sections.
 *
 * Expects a request body of { fileIds: [] }
 *
 * Respond with a batch id that can be used to poll progress and results.
 */
app.post('/items', (req, res, next) => {
  analyser.batchItems(req.body.fileIds)
    .then(({ batchId }) => {
      res.json({
        success: true,
        batchId,
      });
    })
    .catch(err => next(err));
});

/**
 * Encode a number of (previously created) files by fileId.
 *
 * Expects a request body of { files: [ { fileId, items } ] }
 *
 * Respond with a batch id that can be used to poll progress and results.
 */
app.post('/encode', (req, res, next) => {
  analyser.batchEncode(req.body.files)
    .then(({ batchId }) => {
      res.json({
        success: true,
        batchId,
      });
    })
    .catch(err => next(err));
});

/**
 * Poll the status of the given batch, returning the number of files processed only.
 */
app.get('/batch/:batchId', (req, res, next) => {
  analyser.getBatch(req.params.batchId)
    .then(({ completed, total }) => {
      res.json({
        success: true,
        completed,
        total,
      });
    })
    .catch(err => next(err));
});

/**
 * Delete the given batch, cancelling any pending tasks in it.
 */
app.delete('/batch/:batchId', (req, res, next) => {
  analyser.deleteBatch(req.params.batchId)
    .then(() => {
      res.json({
        success: true,
      });
    })
    .catch(err => next(err));
});

/**
 * Poll the status of the given batch, including all results available already.
 */
app.get('/batch/:batchId/results', (req, res, next) => {
  analyser.getBatchResults(req.params.batchId)
    .then(({ completed, total, results }) => {
      res.json({
        success: true,
        completed,
        total,
        results,
      });
    })
    .catch(err => next(err));
});

export default app;
