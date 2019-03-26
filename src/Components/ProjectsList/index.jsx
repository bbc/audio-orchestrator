import React from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import {
  Container,
  Card,
  Menu,
} from 'semantic-ui-react';

import NewProjectItem from './NewProjectItem';
import ProjectItem from './ProjectItem';

const ProjectsList = () => (
  <Container>
    <Menu inverted color="blue" attached="bottom">
      <Menu.Item header>All Projects</Menu.Item>
      <Menu.Item position="right">Orchestration Builder v0.0.0</Menu.Item>
    </Menu>

    <Card.Group stackable itemsPerRow={3}>
      <NewProjectItem />
      {[1, 2, 3].map(d => (
        <ProjectItem key={`item-${d}`} projectId={d} />))
      }
    </Card.Group>
  </Container>
);

// export default connect(mapStateToProps)(ProjectsList);
export default ProjectsList;
