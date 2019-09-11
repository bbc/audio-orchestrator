import TaskManager from '../src/taskManager';

const mockFileStore = {};

describe('TaskManager', () => {
  it('stores a reference to the fileStore', () => {
    const tm = new TaskManager(mockFileStore);

    expect(tm.fileStore).toBe(mockFileStore);
  });

  it('creates a taskId', () => {
    const tm = new TaskManager(mockFileStore);

    return tm.createTask(() => Promise.resolve({}), {})
      .then(({ taskId }) => {
        expect(taskId).toEqual(expect.any(String));
      })
      .then(() => tm.taskQueue.drain());
  });

  it('causes the worker to be called with the right arguments', () => {
    const tm = new TaskManager(mockFileStore);
    const mockArgs = {
      foo: 'bar',
    };

    const mockWorker = (args, onProgress) => {
      expect(args.foo).toEqual('bar');
      expect(args.fileStore).toBe(mockFileStore);
      expect(onProgress).toEqual(expect.any(Function));
      return Promise.resolve({ result: {} });
    };

    return tm.createTask(mockWorker, mockArgs)
      .then(() => tm.taskQueue.drain());
  });

  it('returns task result in status', () => {
    const tm = new TaskManager(mockFileStore);
    const mockArgs = {};
    const mockResult = {};

    const mockWorker = (args, onProgress) => {
      onProgress({ completed: 1, total: 1, currentStep: 'foo' });
      return Promise.resolve({ result: mockResult });
    };

    let returnedTaskId;
    return tm.createTask(mockWorker, mockArgs)
      .then(({ taskId }) => {
        returnedTaskId = taskId;
      })
      .then(() => tm.taskQueue.drain())
      .then(() => tm.getTask(returnedTaskId))
      .then(({
        error, result, currentStep, completed, total,
      }) => {
        expect(error).toBeFalsy();
        expect(result).toBe(mockResult);
        expect(completed).toBe(total);
        expect(currentStep).toBe('foo');
      });
  });

  it('returns task errors as string', () => {
    const tm = new TaskManager(mockFileStore);
    const mockArgs = {};

    // Important that the error is thrown inside the returned promise, not before.
    const mockWorker = () => Promise.resolve()
      .then(() => {
        throw new Error('mock error');
      });

    let returnedTaskId;
    return tm.createTask(mockWorker, mockArgs)
      .then(({ taskId }) => {
        returnedTaskId = taskId;
      })
      .then(() => tm.taskQueue.drain())
      .then(() => tm.getTask(returnedTaskId))
      .then(({
        error,
      }) => {
        expect(error).toBe('mock error');
      });
  });

  it('can cancel a task', () => {
    const tm = new TaskManager(mockFileStore);
    const mockArgs = {};

    // Important that the error is thrown inside the returned promise, not before.
    const mockWorker = jest.fn(() => {});

    let returnedTaskId;
    return tm.createTask(mockWorker, mockArgs)
      .then(({ taskId }) => {
        returnedTaskId = taskId;
      })
      .then(() => tm.cancelTask(returnedTaskId))
      .then(() => tm.taskQueue.drain())
      .then(() => {
        expect(() => tm.getTask(returnedTaskId)).toThrow();
        expect(mockWorker).not.toHaveBeenCalled();
      });
  });
});
