import express from 'express';

const app = express();

app.post('/', (req, res) => {
  res.json({ method: 'post', message: 'hello world' });
});

app.get('/', (req, res) => {
  res.json({ method: 'get', message: 'foo bar' });
});

export default app;
