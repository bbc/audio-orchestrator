import express from 'express';
import bodyParser from 'body-parser';
import Analyser from './analyse';

const analyser = new Analyser();

const app = express();
app.use(bodyParser.json());

/**
 * Create a new file object in the analyser for the given path.
 */
app.post('/', (req, res, next) => {
  const { fileId, path } = req.body;
  analyser.createFile(fileId, path)
    .then(() => {
      res.json({
        success: true,
        fileId,
      });
    })
    .catch(err => next(err));
});

/**
 * List all files currently available to analyse.
 */
app.get('/', (req, res, next) => {
  analyser.listFiles()
    .then((files) => {
      res.json({
        success: true,
        files,
      });
    })
    .catch(err => next(err));
});

/**
 * Get full details of a single file
 */
app.get('/:fileId', (req, res, next) => {
  analyser.getFile(req.params.fileId)
    .then((file) => {
      res.json({
        success: true,
        file,
      });
    })
    .catch(err => next(err));
});

/**
 * Trigger analysis for basic codec information via ffprobe
 */
app.post('/:fileId/probe', (req, res, next) => {
  analyser.probe(req.params.fileId)
    .then(({ probe }) => {
      res.json({
        success: true,
        probe,
      });
    })
    .catch(err => next(err));
});

/**
 * Trigger analysis for silence
 */
app.post('/:fileId/silence', (req, res, next) => {
  analyser.silence(req.params.fileId)
    .then(({ silence }) => {
      res.json({
        success: true,
        silence,
      });
    })
    .catch(err => next(err));
});


export default app;
