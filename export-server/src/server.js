import http from 'http';
import express from 'express';
import exportApp from './app';

const app = express();

// Set the CORS header to allow cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Accept, Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// mount he actual app at path /export
app.use('/export', exportApp);

// last, define an error handler that masks the trace but logs the error
app.use((err, req, res, next) => {
  console.log(err);
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
server.listen(port, () => console.log(`export-server started on port ${port}`));
