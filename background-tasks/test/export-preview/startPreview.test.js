import { jest } from '@jest/globals';
import os from 'os';

jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(() => {}),
}));

os.networkInterfaces = jest.fn(() => ({}));

class MockServer {
  constructor() {
    this.handlers = {};
  }

  on(name, cb) {
    this.handlers[name] = cb;
  }

  listen(...args) {
    const cb = args[args.length - 1];
    cb(this);
  }

  // eslint-disable-next-line class-methods-use-this
  address() {
    return { port: 1234, address: 'mock-address' };
  }

  // eslint-disable-next-line class-methods-use-this
  close() {}
}

jest.unstable_mockModule('net', () => ({
  default: {
    createServer: jest.fn(() => new MockServer()),
  },
}));

jest.unstable_mockModule('http', () => ({
  default: {
    createServer: jest.fn(() => new MockServer()),
  },
}));

jest.mock('finalhandler');

jest.mock('serve-static');

const { default: startPreview } = await import('../../src/export-preview/startPreview.js');
const { default: net } = await import('net');
const { default: http } = await import('http');
const { default: serveStatic } = await import('serve-static');

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('startPreview', () => {
  it('returns a promise passing through arguments and adding a url and a stop function', () => {
    const args = {
      outputDir: '/dev/null',
      settings: {},
    };

    return startPreview(args)
      .then((result) => {
        expect(result).toEqual({
          ...args,
          settings: {
            ...args.settings,
            joiningLink: expect.stringContaining('mock-address:1234/#!/join'),
          },
          previewUrl: expect.any(String),
          stopPreview: expect.any(Function),
        });
      });
  });

  it('selects an unused port on an external interface', () => {
    const args = {
      outputDir: '/dev/null',
    };

    os.networkInterfaces.mockReturnValueOnce({
      mock0: [
        {
          address: 'foo',
          family: 'IPv4',
          internal: false,
        },
        {
          address: 'bar',
          family: 'IPv4',
          internal: false,
        },
      ],
      mock1: [
        {
          address: 'internal',
          family: 'IPv4',
          internal: true,
        },
      ],
    });

    const mockServer = new MockServer();
    const mockListen = jest.spyOn(mockServer, 'listen');
    net.createServer.mockReturnValue(mockServer);
    mockListen.mockImplementationOnce(() => mockServer.handlers.error());

    return startPreview(args)
      .then((result) => {
        expect(os.networkInterfaces).toHaveBeenCalled();
        expect(mockListen).toHaveBeenCalledTimes(2);
        expect(mockListen).toHaveBeenCalledWith(8000, 'foo', expect.any(Function));
        expect(mockListen).toHaveBeenCalledWith(8001, 'foo', expect.any(Function));
        expect(result.previewUrl).toEqual('http://mock-address:1234'); // MockServer.address() returns this
      });
  });

  it('starts an http server in outputDir/dist', () => {
    const args = {
      outputDir: '/dev/null',
    };

    return startPreview(args)
      .then(() => {
        expect(serveStatic).toHaveBeenCalledWith(`${args.outputDir}/dist`);
      });
  });

  it('stops the server when the returned stop function is called', () => {
    const args = {
      outputDir: '/dev/null',
    };

    const mockServer = new MockServer();
    const mockClose = jest.spyOn(mockServer, 'close');

    http.createServer.mockReturnValue(mockServer);

    return startPreview(args)
      .then(({ stopPreview }) => {
        expect(mockClose).not.toHaveBeenCalled();
        stopPreview();
        expect(mockClose).toHaveBeenCalled();
      });
  });
});
