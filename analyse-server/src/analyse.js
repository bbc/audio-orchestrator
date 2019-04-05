import { promisify } from 'util';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { path as ffprobePath } from 'ffprobe-static';
import { path as ffmpegPath } from 'ffmpeg-static';
import ffprobeCB from 'node-ffprobe';

// configure the ffprobe module with the path to the bundled ffprobe
ffprobeCB.FFPROBE_PATH = ffprobePath;

// wrap callback-based methods in a promise API:
const stat = promisify(fs.stat);
const ffprobe = promisify(ffprobeCB);

class Analyser {
  constructor() {
    this.files = {}; // data about each file, including internal info and analysis results.
    this.filePathToId = {}; // a map of all paths to their fileId for lookup by path.
    this.fileIds = []; // list of all fileIds assigned for iteration.
  }

  /**
   * Create a simplified object suitable for returning to the user in a short format (not including
   * full analysis results).
   *
   * @returns {Object}
   * @private
   */
  shortFormat(fileId) {
    if (!(fileId in this.files)) return null;

    const {
      name,
      duration,
      sampleRate,
      numChannels,
      silenceAnalysisStarted,
      silenceAnalysisProgress,
    } = this.files[fileId];

    return {
      fileId,
      name,
    };
  }

  /**
   * Create a simplified object suitable for returning to the user in a long format (including all
   * analysis results).
   *
   * @returns {Object}
   * @private
   */
  longFormat(fileId) {
    if (!(fileId in this.files)) return null;

    const {
      probe,
      // SilenceAnalysisResults,
    } = this.files[fileId];

    const {
      duration,
      sampleRate,
      numChannels,
    } = probe;

    return {
      ...this.shortFormat(fileId),
      // SilenceAnalysisResults,
      probe: {
        duration,
        sampleRate,
        numChannels,
      },
    };
  }

  /**
   * Lists all files managed by this analyser.
   *
   * @returns {Promise<Array<Object>>}
   */
  listFiles() {
    return Promise.resolve(
      this.fileIds.map(fileId => this.longFormat(fileId)),
    );
  }

  /**
   * Gets detailed information about a single file by its id.
   *
   * @returns {Promise<Object>}
   */
  getFile(fileId) {
    if (!(fileId in this.files)) {
      throw new Error('No such file');
    }

    return Promise.resolve(this.longFormat(fileId));
  }

  /**
   * Creates a file from its path on the local disk.
   *
   * @returns {Promise<String>} fileId
   */
  createFile(fileId, filePath) {
    if (!path.isAbsolute(filePath)) {
      throw new Error('Not an absolute path');
    }

    const normalizedPath = path.normalize(filePath);

    return stat(normalizedPath)
      .then(() => {
        const file = {
          fileId,
          path: normalizedPath,
          name: path.basename(normalizedPath),
        };

        this.files[fileId] = file;
        this.filePathToId[normalizedPath] = fileId;
        this.fileIds.push(fileId);

        return fileId;
      });
  }

  /**
   * run ffprobe analysis and update the file with the results from it.
   *
   * @returns {Promise<Object>} probe results once available
   */
  probe(fileId) {
    // ensure the fileId is valid
    if (!(fileId in this.files)) {
      throw new Error('No such file');
    }
    const file = this.files[fileId];

    // To check if a call to ffprobe for this file is currently in progress, store the resulting
    // promise with the file object. Return the pending promise if one is already set.
    if (file.probePromise) {
      return file.probePromise;
    }

    // call ffprobe and wait for the results and then check and use them
    file.probePromise = ffprobe(file.path)
      .then((data) => {
        // reset the probe promise, as we are not waiting for the ffprobe call any more
        file.probePromise = null;

        // ensure there is at least one stream detected in the file and return the first one
        if (!data.streams || data.streams.length === 0) {
          throw new Error('No media streams in file');
        }
        return data.streams[0];
      })
      .then((stream) => {
        // ensure the stream is an audio stream before accessing its properties
        if (stream.codec_type !== 'audio') {
          throw new Error('First stream in file does not contain an audio codec');
        }
        /* eslint-disable-next-line camelcase */
        const { sample_rate, channels, duration } = stream;

        const probe = {
          sampleRate: sample_rate,
          numChannels: channels,
          duration,
        };

        // replace the file object, replacing some of its properties
        this.files[fileId] = {
          ...file,
          probe,
        };

        // return the short-format file object which includes the probe results for convenience
        return this.longFormat(fileId);
      });

    // return the new promise
    return file.probePromise;
  }

  /**
   * run silence analysis process.
   */
  silence(fileId) {
    // ensure the fileId is valid
    if (!(fileId in this.files)) {
      throw new Error('No such file');
    }
    const file = this.files[fileId];

    // Return the pending promise if one is already set.
    if (file.silencePromise) {
      return file.silencePromise;
    }

    // start silence detection
    // ffmpeg arguments
    const ffmpegArgs = [
      '-i', file.path, // input file path
      '-af', 'silencedetect=n=-80dB:d=0.1', // silence detect noise floor and minimum silence length
      '-f', 'null', // no output
      '-', // output to stdout
    ];

    const silenceExpression = /silence_end: (?<end>\d+\.\d+) \| silence_duration: (?<duration>\d+\.\d+)/;

    file.silencePromise = new Promise((resolve, reject) => {
      const results = [];

      const ffmpegProcess = spawn(
        ffmpegPath,
        ffmpegArgs,
        {
          stdio: ['ignore', 'pipe', 'pipe'],
        },
      );

      ffmpegProcess.on('error', (err) => {
        reject(err);
      });

      ffmpegProcess.stderr.on('data', (data) => {
        const match = `${data}`.match(silenceExpression);

        if (match) {
          const { end, duration } = match.groups;

          if (!!end && !!duration) {
            results.push({ end, duration });
          }
        }
      });

      ffmpegProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`ffmpeg exited with non-zero code: ${code}`));
        }

        resolve({ silence: results });
      });
    });

    return file.silencePromise;
  }
}

export default Analyser;
