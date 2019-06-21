import LocalProjectStore from '../lib/LocalProjectStore';
import {
  requestListProjects,
} from './project';

const ProjectStore = window.ProjectStore || LocalProjectStore;

export const requestOpenDevTools = () => () => {
  if (window.openDevTools) {
    window.openDevTools();
  }
};

export const requestExportProject = projectId => () => {
  const projectData = ProjectStore.dumpProjectData(projectId);

  const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectId}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const requestImportProject = () => (dispatch) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.multiple = false;

  const onChange = () => {
    const { files } = input;
    input.removeEventListener('change', onChange);
    document.body.removeChild(input);

    if (files.length === 1) {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        const projectData = JSON.parse(reader.result);
        ProjectStore.importProjectData(projectData);
        dispatch(requestListProjects());
      });
      reader.readAsText(files[0]);
    }
  };

  input.addEventListener('change', onChange);
  document.body.appendChild(input);

  input.click();
};
