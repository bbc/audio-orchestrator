import http from 'http';
import app from './app';

const port = process.env.PORT || 8000;

app.set('port', port);
const server = http.createServer(app);

server.listen(port, () => console.log(`analyse-server started on port ${port}`));
