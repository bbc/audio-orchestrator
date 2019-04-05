import React from 'react';
import PropTypes from 'prop-types';
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
    {projects.map(({ projectId, name, lastOpened }) => (
      <ProjectItem key={projectId} projectId={projectId} name={name} lastOpened={lastOpened} />
    ))}
  </Card.Group>
);

ProjectsList.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
};

// export default connect(mapStateToProps)(ProjectsList);
export default ProjectsList;
