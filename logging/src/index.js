const os = require('os');
const path = require('path');
const winston = require('winston');

// A format that prefixes the message with the component and removes the component property if set.
const componentPrefixFormat = winston.format((info) => {
  if (info.component) {
    info.message = `[${info.component}] ${info.message}`;
    delete info.component;
  }
  return info;
});

// Configure the root logger instance to derive per-component loggers from
const rootLogger = winston.createLogger({
  exitOnError: false,
  format: winston.format.combine(
    winston.format.errors(),
  ),
  transports: [
    new winston.transports.Console({
      level: 'silly',
      format: winston.format.combine(
        winston.format.cli(),
        componentPrefixFormat(),
        winston.format.simple(),
      ),
      handleExceptions: true,
    }),
    new winston.transports.File({
      filename: path.join(os.homedir(), 'bbcat-orchestration-builder.log'),
      level: 'silly',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxsize: 4 * 1024 * 1024, // 4MB
      maxFiles: 2,
      tailable: true,
      handleExceptions: true,
    }),
  ],
});

module.exports = {
  rootLogger,
  analyseLogger: rootLogger.child({ component: 'background-tasks' }), // TODO remove
  exportLogger: rootLogger.child({ component: 'background-tasks' }), // TODO remove
  electronLogger: rootLogger.child({ component: 'electron-app' }),
  getLogger: name => rootLogger.child({ component: name }),
};
