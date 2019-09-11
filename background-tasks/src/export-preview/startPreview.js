import { exportLogger as logger } from 'bbcat-orchestration-builder-logging';
import fse from 'fs-extra';
import path from 'path';
import os from 'os';
import net from 'net';
import http from 'http';
import finalhandler from 'finalhandler';
import serveStatic from 'serve-static';

const DEFAULT_PORT = 8000;

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
        logger.info(`Preview server for ${distDir} listening on ${address}:${port}.`);
        resolve({
          stopPreview: () => server.close(),
          previewUrl: `http://${address}:${port}`,
        });
      });
    }))
    .then(({ stopPreview, previewUrl }) => ({ ...args, stopPreview, previewUrl }));
};

export default startPreview;
