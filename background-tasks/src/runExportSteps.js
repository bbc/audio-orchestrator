import { getLogger } from 'bbcat-orchestration-builder-logging';
import ProgressReporter from './progressReporter';
import withOutputDir from './withOutputDir';

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
