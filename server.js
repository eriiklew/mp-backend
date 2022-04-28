const debug = require('debug')('node-angular');
const http = require('http');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || '3005';

// Handle Uncaught exceptions before any of the code execution
process.on('uncaughtException', (err) => {
  console.log('Unhandled Exception : Shutting down...');
  console.log(err);
  process.exit(1);
});

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `pipe ${port}` : `port ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const bind = typeof port === 'string' ? `pipe ${port}` : `port ${port}`;
  debug(`Listening on ${bind}`);
};

app.set('port', port);

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);
server.listen(port);

// Handle Uncaught rejections - Like db password error
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection : Shutting down...');
  console.log(err.message);
  server.close(() => {
    process.exit(1);
  });
});
