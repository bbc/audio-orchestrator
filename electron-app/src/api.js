/**
 * A server process combining all the API calls tobe available locally.
 */
import { createServer } from 'http';
import express from 'express';
import analyse from 'bbcat-orchestration-builder-analyse-server';

// Create the top level application
const app = express();

// Allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Hook each server application to a top-level path
app.use('/analyse', analyse);

// Dummy response for testing
app.get('/foo', (req, res) => {
  res.json({ bar: true });
});

// create and start a server, using a random free TCP port by setting port to 0.
const host = '127.0.0.1';

const server = createServer(app);
server.listen(0, host, () => {
  const { port } = server.address();
  console.log(`API listening on ${host}:${port}`);

  process.send({
    ready: true,
    host,
    port,
  });
});
