import ProgressReporter from '../src/progressReporter';

const setup = (numSteps) => {
  const mockOnProgress = jest.fn(() => {});
  const pr = new ProgressReporter(numSteps, mockOnProgress);
  return { mockOnProgress, pr };
};

describe('ProgressReporter', () => {
  it('calls onProgress', () => {
    const { mockOnProgress, pr } = setup(2);
    pr.advance('foo');

    expect(mockOnProgress).toHaveBeenCalledTimes(1);
  });


  it('advances a task starting at 0', () => {
    const { mockOnProgress, pr } = setup(4);

    pr.advance('foo');
    pr.advance('bar');

    expect(mockOnProgress).toHaveBeenCalledTimes(2);

    expect(mockOnProgress).toHaveBeenCalledWith({
      completed: 0,
      total: 4,
      currentStep: 'foo',
    });

    expect(mockOnProgress).toHaveBeenCalledWith({
      completed: 1,
      total: 4,
      currentStep: 'bar',
    });
  });

  it('completes a task', () => {
    const { mockOnProgress, pr } = setup(2);

    pr.complete();
    expect(mockOnProgress).toHaveBeenCalledTimes(1);
    expect(mockOnProgress).toHaveBeenCalledWith({
      completed: 2,
      total: 2,
      currentStep: 'done',
    });
  });

  it('returns a function from advance', () => {
    const { mockOnProgress, pr } = setup(2);

    const returnedFn = pr.advance('foo');
    expect(mockOnProgress).toHaveBeenCalledTimes(1);
    expect(typeof returnedFn).toBe('function');
  });

  it('triggers fractional progress when the function returned from advance is called.', () => {
    const { mockOnProgress, pr } = setup(2);

    const returnedFn = pr.advance('foo');
    returnedFn({ completed: 5, total: 10, currentStep: 'bar' });

    expect(mockOnProgress).toHaveBeenCalledTimes(2);
    expect(mockOnProgress).toHaveBeenNthCalledWith(2, {
      completed: 0.5,
      total: 2,
      currentStep: 'bar',
    });
  });
});
