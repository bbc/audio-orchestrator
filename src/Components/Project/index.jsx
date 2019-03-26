import React from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Menu,
  Tab,
} from 'semantic-ui-react';

import { closeProject } from '../../reducers/UIReducer';
import Sequences from './Sequences';
import Presentation from './Presentation';
import Advanced from './Advanced';
import Review from './Review';

const tabPanes = [
  { menuItem: 'Sequences', render: () => <Tab.Pane><Sequences /></Tab.Pane> },
  { menuItem: 'Presentation', render: () => <Tab.Pane><Presentation /></Tab.Pane> },
  { menuItem: 'Advanced', render: () => <Tab.Pane><Advanced /></Tab.Pane> },
  { menuItem: 'Preview and Export', render: () => <Tab.Pane><Review /></Tab.Pane> },
];

const Project = ({ onClose }) => (
  <Container>
    <Menu inverted color="orange" attached="bottom">
      <Menu.Item header>My first project</Menu.Item>
      <Menu.Item position="right" icon="close" content="close" labelPosition="right" floated="right" onClick={onClose} />
    </Menu>
    <Tab panes={tabPanes} menu={{ secondary: false, pointing: true }} />
  </Container>
);

const mapDispatchToProps = dispatch => ({
  onClose: () => dispatch(closeProject()),
});

export default connect(null, mapDispatchToProps)(Project);
