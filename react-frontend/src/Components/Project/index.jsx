import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Menu,
  Message,
  Divider,
} from 'semantic-ui-react';
import Sequences from './Sequences';
import Controls from './Controls';
import Objects from './Objects';
import Presentation from './Presentation';
import Export from './Export';
import ProjectStepBar from './ProjectStepBar';
import SaveIndicator from './SaveIndicator';
import {
  closeProject,
} from '../../actions/project';
import {
  PAGE_PROJECT_SEQUENCES,
  PAGE_PROJECT_CONTROLS,
  PAGE_PROJECT_OBJECTS,
  PAGE_PROJECT_PRESENTATION,
  PAGE_PROJECT_EXPORT,
} from '../../reducers/UIReducer';

// Define the mapping from the currentProjectPage strings to the react components to render
const projectPageComponents = {
  [PAGE_PROJECT_SEQUENCES]: Sequences,
  [PAGE_PROJECT_CONTROLS]: Controls,
  [PAGE_PROJECT_OBJECTS]: Objects,
  [PAGE_PROJECT_PRESENTATION]: Presentation,
  [PAGE_PROJECT_EXPORT]: Export,
};

const Project = ({
  projectId,
  onClose,
  name,
  currentProjectPage,
  saveCount,
}) => {
  const ProjectPage = projectPageComponents[currentProjectPage];
  return (
    <Container>
      <Menu inverted color="orange" attached>
        <Menu.Item header content={name} />
        <SaveIndicator count={saveCount} />
        <Menu.Item position="right" icon="close" content="close" onClick={onClose} />
      </Menu>
      <ProjectStepBar projectId={projectId} />

      <Divider hidden />

      { ProjectPage
        ? <ProjectPage projectId={projectId} />
        : (
          <Container>
            <Message error content="Project page not found" />
          </Container>
        )}
    </Container>
  );
};

Project.propTypes = {
  projectId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  currentProjectPage: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  saveCount: PropTypes.number.isRequired,
};

const mapStateToProps = (state, { projectId }) => ({
  name: state.Project.projects[projectId].name,
  saveCount: state.Project.projects[projectId].saveCount,
  currentProjectPage: state.UI.currentProjectPage,
});

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onClose: () => dispatch(closeProject(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Project);
