import { analyseLogger as logger } from 'bbcat-orchestration-builder-logging';
import http from 'http';
import express from 'express';
import analyseApp from './app';

// create express app for standalone server application
const app = express();

// Set the CORS header to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Accept, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// mount he actual app at path /analyse
app.use('/analyse', analyseApp);

// last, define an error handler that masks the trace but logs the error
app.use((err, req, res, next) => {
  logger.warn(err);
  if (res.headersSent) {
    next(err);
  } else {
    res.status(500);
    res.json({ success: false });
  }
});

// create and start a server on the specified or default port.
const port = process.env.PORT || 8000;
const server = http.createServer(app);
server.listen(port, () => logger.info(`analyse-server started on port ${port}`));
