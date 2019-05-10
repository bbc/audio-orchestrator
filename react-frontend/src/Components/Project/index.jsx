import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Menu,
  Tab,
} from 'semantic-ui-react';

import {
  closeProject,
  setProjectName,
} from '../../actions/project';
import Sequences from './Sequences';
import Presentation from './Presentation';
import Advanced from './Advanced';
import Review from './Review';
import EditableMenuHeader from './EditableMenuHeader';

const Project = ({
  projectId,
  onClose,
  onSetName,
  name,
}) => {
  const tabPanes = [
    { menuItem: 'Sequences', render: () => <Sequences projectId={projectId} /> },
    { menuItem: 'Presentation', render: () => <Presentation projectId={projectId} /> },
    { menuItem: 'Advanced', render: () => <Advanced projectId={projectId} /> },
    { menuItem: 'Preview and Export', render: () => <Review projectId={projectId} /> },
  ];

  return (
    <Container>
      <Menu inverted color="orange" attached="bottom">
        <EditableMenuHeader value={name} onChange={onSetName} />
        <Menu.Item position="right" icon="close" content="close" onClick={onClose} />
      </Menu>
      <Tab panes={tabPanes} menu={{ secondary: false, pointing: true, color: 'orange' }} />
    </Container>
  );
};

Project.propTypes = {
  projectId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onSetName: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { projectId }) => ({
  name: state.Project.projects[projectId].name,
});

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onClose: () => dispatch(closeProject(projectId)),
  onSetName: name => dispatch(setProjectName(projectId, name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Project);
