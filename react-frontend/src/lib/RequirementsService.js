import BackgroundTasks from './BackgroundTasks';

class RequirementsService {
  constructor() {
    this.tasks = new BackgroundTasks();
  }

  checkRequirements(callbacks = {}) {
    return this.tasks.createTask('check-requirements', {}, callbacks);
  }
}

export default RequirementsService;
