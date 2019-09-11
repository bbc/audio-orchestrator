import runExportSteps from '../src/runExportSteps';

describe('runExportSteps', () => {
  it('returns a promise', () => {
    expect(runExportSteps([])).toEqual(expect.any(Promise));
  });

  it('runs the steps and returns the results', () => {
    const steps = [
      {
        name: 'append 2',
        fn: ({ r1 }) => Promise.resolve({ r2: [...r1, 2] }),
      },
      {
        name: 'append 3',
        fn: ({ r2 }) => Promise.resolve({ r3: [...r2, 3] }),
      },
    ];

    return runExportSteps(steps, { r1: [1] })
      .then(({ r3 }) => {
        expect(r3).toEqual([1, 2, 3]);
      });
  });

  it('returns initial arguments and completes the progress if no steps are given', () => {
    const mockProgress = jest.fn();
    return runExportSteps([], { mockArgs: 'mock args' }, mockProgress)
      .then(({ mockArgs }) => {
        expect(mockProgress).toHaveBeenCalledTimes(1);
        expect(mockArgs).toEqual('mock args');
      });
  });

  it('advances the progress once for each step and once on completion', () => {
    const steps = [
      {
        name: 'append 2',
        fn: ({ r1 }) => Promise.resolve({ r2: [...r1, 2] }),
      },
      {
        name: 'append 3',
        fn: ({ r2 }) => Promise.resolve({ r3: [...r2, 3] }),
      },
    ];

    const mockProgress = jest.fn();
    return runExportSteps(steps, { r1: [1] }, mockProgress)
      .then(({ r3 }) => {
        expect(r3).toEqual([1, 2, 3]);
        expect(mockProgress).toHaveBeenCalledTimes(3);
      });
  });

  it('passes on promise rejections and ignores following steps', () => {
    const mockFn1 = jest.fn(({ foo }) => Promise.resolve({ foo, bar: 1 }));
    const mockFn2 = jest.fn(() => { throw new Error('mockFn2 error'); });
    const mockFn3 = jest.fn(() => Promise.resolve({ hello: 'world' }));

    const steps = [
      { name: 'fn1', fn: mockFn1 },
      { name: 'fn2', fn: mockFn2 },
      { name: 'fn3', fn: mockFn3 },
    ];

    return expect(runExportSteps(steps, { foo: 0 }))
      .rejects.toEqual(expect.any(Error))
      .then(() => {
        expect(mockFn1).toHaveBeenCalled();
        expect(mockFn2).toHaveBeenCalled();
        expect(mockFn3).not.toHaveBeenCalled();
      });
  });

  it('works with step functions that do not return a promise', () => {
    const steps = [
      { name: 'foo', fn: () => 'bar' },
    ];

    return runExportSteps(steps)
      .then((result) => {
        expect(result).toEqual('bar');
      });
  });
});
