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

import { getLogger } from '#logging';
import ProgressReporter from './progressReporter.js';
import withOutputDir from './withOutputDir.js';

const logger = getLogger('runExportSteps');

/**
 * Run a series of steps (specified as a name and a function to execute) in a waterfall fashion,
 * that is, each function is given the resolved value of the previous step, returns a promise, and
 * further steps are not executed if an earlier one throws an error.
 *
 * @param {Array<Object>} steps - [{ name: string, fn: function }]
 * @param {Object} initialArgs - passed into the first step's fn.
 * @param {function} onProgress
 *
 * @returns {Promise}
 */
const runExportSteps = (steps, initialArgs, onProgress) => {
  const progress = new ProgressReporter(steps.length, onProgress);

  let i = 0;
  const nextStep = (previousResult) => {
    // End condition, no more steps left to execute
    if (i >= steps.length) {
      progress.complete();
      return previousResult;
    }

    // Get the step name and function, then increment the step index
    const { name, fn } = steps[i];
    i += 1;

    if (typeof previousResult !== 'object') {
      logger.warn(`previousResult to be passed as args is not an object. ${name}: ${JSON.stringify(previousResult)}`);
    }

    // logger.silly(`starting "${name}" with args: ${JSON.stringify(previousResult)}`);

    // advance the progress reporter to indicate the start of the current step, then run the step.
    const onSubProgress = progress.advance(name);
    return Promise.resolve()
      .then(() => fn(previousResult, onSubProgress))
      .then(result => nextStep(result));
  };

  return Promise.resolve()
    .then(() => withOutputDir(nextStep, initialArgs));
};

export default runExportSteps;
