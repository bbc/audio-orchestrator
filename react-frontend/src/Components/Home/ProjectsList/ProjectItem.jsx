import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Table,
  Header,
} from 'semantic-ui-react';
import ConfirmDeleteButton from '#Components/ConfirmDeleteButton.jsx';
import {
  requestOpenProject,
  requestDeleteProject,
} from '#Actions/project.js';

function ProjectItem({
  name,
  lastOpened,
  onOpen,
  onDelete,
}) {
  return (
    <Table.Row>
      <Table.Cell>
        <Header
          style={{ cursor: 'pointer' }}
          tabIndex="0"
          onClick={onOpen}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onOpen();
            }
          }}
          content={name}
          subheader={`Last opened ${new Date(Date.parse(lastOpened)).toLocaleDateString()}`}
        />
      </Table.Cell>
      <Table.Cell collapsing>
        <ConfirmDeleteButton type="from list of recent projects" onDelete={onDelete} small />
      </Table.Cell>
    </Table.Row>
  );
}

ProjectItem.propTypes = {
  name: PropTypes.string.isRequired,
  lastOpened: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onOpen: () => dispatch(requestOpenProject(projectId)),
  onDelete: () => dispatch(requestDeleteProject(projectId)),
});

export default connect(null, mapDispatchToProps)(ProjectItem);
