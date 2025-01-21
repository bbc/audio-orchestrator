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
    return ({ currentStep = stepName, total = 1, completed = 1 } = {}) => {
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
      currentStep: 'Done.',
    });
  }
}

export default ProgressReporter;
