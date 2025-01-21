/**
Copyright (C) 2025, BBC R&D

This file is part of Audio Orchestrator. Audio Orchestrator is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as
published by the Free Software Foundation, either version 3 of the License, or (at
your option) any later version. Audio Orchestrator is distributed in the hope that it
will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
for more details. You should have received a copy of the GNU General Public License
along with Audio Orchestrator. If not, see <https://www.gnu.org/licenses/>.
*/

import winston from 'winston';

// A format that prefixes the message with the component and removes the component property if set.
const componentPrefixFormat = winston.format((info) => {
  if (info.component) {
    // eslint-disable-next-line no-param-reassign
    info.message = `[${info.component}] ${info.message}`;
    // eslint-disable-next-line no-param-reassign
    delete info.component;
  }
  return info;
});

// Configure the root logger instance to derive per-component loggers from
export const rootLogger = winston.createLogger({
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
  ],
});

export const addLogFileTransport = (logFilePath) => {
  rootLogger.add(
    new winston.transports.File({
      filename: logFilePath,
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
  );
};

export const analyseLogger = rootLogger.child({ component: 'background-tasks' }); // TODO remove
export const exportLogger = rootLogger.child({ component: 'background-tasks' }); // TODO remove
export const electronLogger = rootLogger.child({ component: 'electron-app' });
export const getLogger = name => rootLogger.child({ component: name });
