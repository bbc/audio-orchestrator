import BackgroundTasks from './BackgroundTasks';

class RequirementsService {
  constructor(apiBase) {
    this.tasks = new BackgroundTasks({ apiBase });
  }

  checkRequirements(callbacks = {}) {
    return this.tasks.createTask('check-requirements', {}, callbacks);
  }
}

export default RequirementsService;
