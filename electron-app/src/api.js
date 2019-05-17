import { electronLogger as logger } from 'bbcat-orchestration-builder-logging';
import { createServer } from 'http';
import express from 'express';
import analyseApp from 'bbcat-orchestration-builder-analyse-server';
import exportApp from 'bbcat-orchestration-builder-export-server';

/**
 * A server process combining all the API calls tobe available locally.
 */

// Create the top level application
const app = express();

// Allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Accept, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  next();
});

// Hook each server application to a top-level path
app.use('/analyse', analyseApp);
app.use('/export', exportApp);

// Error handler defined last
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
