import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, connect } from 'react-redux';
import {
  Container,
  Menu,
  Message,
  Divider,
} from 'semantic-ui-react';
import { runAlgorithmWithExportedMetadata } from 'Actions/monitoring';
import Sequences from './Sequences';
import Controls from './Controls';
import Audio from './Audio';
import Monitoring from './Monitoring';
import Appearance from './Appearance';
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
  PAGE_PROJECT_MONITORING,
  PAGE_PROJECT_PRESENTATION,
  PAGE_PROJECT_EXPORT,
} from '../../reducers/UIReducer';
import {
  useControls, useObjectsList, useCurrentSetup, useObjects, useCurrentSequenceId,
} from './Monitoring/helpers';

// Define the mapping from the currentProjectPage strings to the react components to render
const projectPageComponents = {
  [PAGE_PROJECT_SEQUENCES]: Sequences,
  [PAGE_PROJECT_CONTROLS]: Controls,
  [PAGE_PROJECT_OBJECTS]: Audio,
  [PAGE_PROJECT_MONITORING]: Monitoring,
  [PAGE_PROJECT_PRESENTATION]: Appearance,
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
