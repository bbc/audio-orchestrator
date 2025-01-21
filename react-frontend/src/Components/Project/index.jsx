import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, connect } from 'react-redux';
import {
  Container,
  Menu,
  Message,
  Divider,
} from 'semantic-ui-react';
import { runAlgorithmWithExportedMetadata } from '#Actions/monitoring.js';
import {
  closeProject,
} from '#Actions/project.js';
import Sequences from './Sequences/index.jsx';
import Controls from './Controls/index.jsx';
import Audio from './Audio/index.jsx';
import Monitoring from './Monitoring/index.jsx';
import Appearance from './Appearance/index.jsx';
import Export from './Export/index.jsx';
import ProjectStepBar from './ProjectStepBar.jsx';
import SaveIndicator from './SaveIndicator.jsx';
import {
  PAGE_PROJECT_SEQUENCES,
  PAGE_PROJECT_CONTROLS,
  PAGE_PROJECT_OBJECTS,
  PAGE_PROJECT_MONITORING,
  PAGE_PROJECT_PRESENTATION,
  PAGE_PROJECT_EXPORT,
} from '../../reducers/UIReducer.js';
import {
  useControls, useObjectsList, useCurrentSetup, useObjects, useCurrentSequenceId,
} from './Monitoring/helpers.js';

// Define the mapping from the currentProjectPage strings to the react components to render
const projectPageComponents = {
  [PAGE_PROJECT_SEQUENCES]: Sequences,
  [PAGE_PROJECT_CONTROLS]: Controls,
  [PAGE_PROJECT_OBJECTS]: Audio,
  [PAGE_PROJECT_MONITORING]: Monitoring,
  [PAGE_PROJECT_PRESENTATION]: Appearance,
  [PAGE_PROJECT_EXPORT]: Export,
};

function Project({
  projectId,
  onClose,
  name,
  currentProjectPage,
  saveCount,
}) {
  const ProjectPage = projectPageComponents[currentProjectPage];
  // Re-run the algorithm (and send OSC messages) whenever something is changed
  const currentSequenceId = useCurrentSequenceId(projectId);
  const objectsList = useObjectsList(projectId, currentSequenceId);
  const objects = useObjects(projectId, currentSequenceId);
  const controls = useControls(projectId);
  const devices = useCurrentSetup(projectId);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      runAlgorithmWithExportedMetadata(objectsList, objects, controls, devices, currentSequenceId),
    );
  }, [objectsList, objects, controls, devices, currentSequenceId, dispatch]);

  return (
    <Container>
      <Menu inverted color="orange" attached>
        <Menu.Item header content={name} />
        <SaveIndicator count={saveCount} />
        <Menu.Item position="right" icon="close" content="Close" onClick={onClose} />
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
}

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
