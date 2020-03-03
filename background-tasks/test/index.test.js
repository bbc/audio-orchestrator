import backgroundTasks from '../src';

describe('background-tasks', () => {
  it('exists', () => {
    expect(backgroundTasks).toEqual({
      checkRequirements: expect.any(Function),
      registerFiles: expect.any(Function),
      probeFiles: expect.any(Function),
      detectItems: expect.any(Function),
      encodeFiles: expect.any(Function),
      exportAudio: expect.any(Function),
      exportTemplate: expect.any(Function),
      exportDistribution: expect.any(Function),
      exportPreview: expect.any(Function),
      getTask: expect.any(Function),
      cancelTask: expect.any(Function),
    });
  });
});
