import React from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import {
  Table,
} from 'semantic-ui-react';

import ProjectItem from './ProjectItem';

const ProjectsList = ({
  projects,
}) => {
  if (projects.length === 0) {
    return null;
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell content="Recent projects" colSpan={2} />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {projects.map(({ projectId, name, lastOpened }) => (
          <ProjectItem key={projectId} projectId={projectId} name={name} lastOpened={lastOpened} />
        ))}
      </Table.Body>
    </Table>
  );
};

ProjectsList.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ProjectsList;
