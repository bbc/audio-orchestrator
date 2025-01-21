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

import fse from 'fs-extra';
import path from 'path';
import os from 'os';
import net from 'net';
import http from 'http';
import finalhandler from 'finalhandler';
import serveStatic from 'serve-static';
import { exportLogger as logger } from '#logging';

const DEFAULT_PORT = 8000;

const previewStopFunctions = [];

const selectHost = () => new Promise((resolve) => {
  const interfacesObj = os.networkInterfaces();
  const addresses = [];
  Object.keys(interfacesObj).forEach((name) => {
    const interfaceAddresses = interfacesObj[name];
    interfaceAddresses.forEach(({ address, family, internal }) => {
      addresses.push({ address, family, internal });
    });
  });

  // Limit to external interfaces
  const externalAddresses = addresses.filter(({ internal }) => !internal);
  if (externalAddresses.length === 1) {
    resolve(externalAddresses[0].address);
    return;
  }

  // Prefer Ipv4 interfaces if multiple external interfaces are connected; select the first one.
  const externalIPv4Addresses = externalAddresses.filter(({ family }) => (family === 'IPv4'));
  if (externalIPv4Addresses.length >= 1) {
    logger.debug(`Found multiple IPv4 addresses: ${externalIPv4Addresses.map(a => a.address).join(', ')}`);

    // Try to find an address in the standard local network space
    // This is mainly for coporate machines that may be on multiple networks / VPNs.
    const preferredAddress = externalIPv4Addresses.find(a => a.address.startsWith('192.'));
    if (preferredAddress) {
      resolve(preferredAddress.address);
      return;
    }

    // otherwise return the first one
    resolve(externalIPv4Addresses[0].address);
    return;
  }

  // If no external interface is listed, try using the catch-all address and let the user figure
  // out how to access the host on their network.
  // reject(new Error('No suitable external network interface found'));
  resolve('0.0.0.0');
});

const getHandle = (host, initialPort = DEFAULT_PORT, retries = 50) => {
  const server = net.createServer();
  return new Promise((resolve, reject) => {
    server.on('error', (e) => {
      if (retries <= 0) {
        logger.debug(e);
        reject(new Error('Failed to select an available port for the preview server.'));
      } else {
        resolve(getHandle(host, initialPort + 1, retries - 1));
      }
    });

    logger.debug(`Trying to bind to ${host}:${initialPort}`);
    server.listen(initialPort, host, () => {
      resolve(server);
    });
  });
};

const startPreview = (args) => {
  const { outputDir } = args;

  logger.debug('start preview');

  let distDir;
  let serve;
  let server;

  return Promise.resolve()
    .then(() => {
      distDir = path.join(outputDir, 'dist');
    })
    .then(() => fse.ensureDir(distDir))
    .then(() => {
      // Stop any preview server that might still be running
      while (previewStopFunctions.length > 0) {
        try {
          previewStopFunctions.shift()();
        } catch (e) {
          logger.warn('could not stop a previous preview server', e);
        }
      }
    })
    .then(() => {
      serve = serveStatic(distDir);
      server = http.createServer((req, res) => {
        serve(req, res, finalhandler(req, res));
      });
    })
    .then(() => selectHost())
    .then(host => getHandle(host, DEFAULT_PORT))
    .then(handle => new Promise((resolve, reject) => {
      server.on('error', (e) => {
        reject(e);
      });

      server.listen(handle, () => {
        const { port, address } = server.address();

        const previewUrl = `http://${address}:${port}`;

        const stopPreview = () => {
          logger.info(`Stopping preview server at ${previewUrl}.`);
          server.close();
        };

        // Save the stop function here as well, to be able to stop the server without user request
        previewStopFunctions.push(stopPreview);

        logger.info(`Preview server for ${distDir} running at ${address}:${port}.`);

        resolve({
          stopPreview,
          previewUrl,
        });
      });
    }))
    .then(({ stopPreview, previewUrl }) => ({
      ...args,
      settings: {
        ...args.settings,
        joiningLink: `${previewUrl}/#!/join`,
      },
      stopPreview,
      previewUrl,
    }));
};

export default startPreview;
