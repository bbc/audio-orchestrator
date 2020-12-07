import { useEffect } from 'react';
import { useSelector } from 'react-redux';

// Buffers calls to the given function to ensure it is called at most once for each
// timeout milliseconds, and ensures it is called even if the timeout has not been reached
// when the component is unmounted.
// Returns a debounced version of the function.
export const useDebounce = (fn, timeout = 300) => {
  let lastCall = Date.now();
  let callCount = 0;
  let t;
  let fnWithArgs = null;

  useEffect(() => () => {
    clearTimeout(t);
    // Ensure last buffered call is still applied on onmounting, even if timeout not reached.
    if (fnWithArgs && callCount > 0) {
      fnWithArgs();
    }
  });

  return (...args) => {
    callCount += 1;
    fnWithArgs = () => fn(...args);

    clearTimeout(t);

    t = setTimeout(() => {
      callCount = 0;
      lastCall = Date.now();

      fnWithArgs();
    }, (Date.now() - lastCall > timeout) ? 0 : timeout);
  };
};

export const useProjectId = () => useSelector(state => state.UI.currentProjectId);

// shortcut for accessing the currently open project.
// calls the selector function with the project or undefined if none is open.
// if a selector is not give, returns the entire project.
export const useProject = (selector) => {
  const projectId = useProjectId();
  const project = useSelector(state => state.Project.projects[projectId]);

  if (!selector) {
    return project;
  }

  return selector(project);
};
