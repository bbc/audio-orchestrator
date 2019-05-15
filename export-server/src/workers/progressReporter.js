
class ProgressReporter {
  constructor(total, onProgress = () => {}) {
    this.completed = -1; // start at -1 because first report is after advancing to first step.
    this.total = total;
    this.onProgress = onProgress;
  }

  advance(stepName) {
    this.completed += 1;

    // save progress at the start of this step and trigger onProgress with 0 sub-step progress.
    const completedInitial = this.completed;
    this.onProgress({
      completed: completedInitial,
      total: this.total,
      currentStep: stepName,
    });

    // return a function that can report sub progress.
    // This is intended to be given to another progress reporter as its onProgress handler.
    return ({ currentStep, total = 1, completed = 1 } = {}) => {
      if (this.completed > (completedInitial + 1) || completed >= total) {
        return;
      }

      this.onProgress({
        completed: completedInitial + (completed / total),
        total: this.total,
        currentStep,
      });
    };
  }

  complete() {
    this.completed = this.total;
    this.onProgress({
      completed: this.completed,
      total: this.total,
      currentStep: 'done',
    });
  }
}

export default ProgressReporter;
