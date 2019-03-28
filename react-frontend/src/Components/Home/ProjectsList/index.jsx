import React from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import {
  Card,
  Loader,
} from 'semantic-ui-react';

import ProjectItem from './ProjectItem';

const ProjectsList = ({
  projects,
  loading,
}) => (
  <Card.Group stackable itemsPerRow={3}>
    <Loader active={loading} inline="centered" />
    {projects.map(({ projectId, name }) => (
      <ProjectItem key={projectId} projectId={projectId} name={name} />))
    }
  </Card.Group>
);

// export default connect(mapStateToProps)(ProjectsList);
export default ProjectsList;
