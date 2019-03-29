import React from 'react';
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

const tabPanes = [
  { menuItem: 'Sequences', render: () => <Tab.Pane><Sequences /></Tab.Pane> },
  { menuItem: 'Presentation', render: () => <Tab.Pane><Presentation /></Tab.Pane> },
  { menuItem: 'Advanced', render: () => <Tab.Pane><Advanced /></Tab.Pane> },
  { menuItem: 'Preview and Export', render: () => <Tab.Pane><Review /></Tab.Pane> },
];

const Project = ({
  onClose,
  onSetName,
  name,
}) => (
  <Container>
    <Menu inverted color="orange" attached="bottom">
      <EditableMenuHeader value={name} onChange={onSetName} />
      <Menu.Item position="right" icon="close" content="close" onClick={onClose} />
    </Menu>
    <Tab panes={tabPanes} menu={{ secondary: false, pointing: true }} />
  </Container>
);

const mapStateToProps = state => ({
  name: state.Project.name,
});

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(closeProject()),
  onSetName: name => dispatch(setProjectName(name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Project);
