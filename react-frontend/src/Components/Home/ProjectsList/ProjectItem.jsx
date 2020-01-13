import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  Button,
} from 'semantic-ui-react';
import ConfirmDeleteButton from '../../ConfirmDeleteButton';
import {
  requestOpenProject,
  requestDeleteProject,
} from '../../../actions/project';

const ProjectItem = ({
  name,
  onOpen,
  onDelete,
}) => (
  <Card color="orange">
    <Card.Content>
      <Card.Header content={name} />
    </Card.Content>
    <Card.Content extra textAlign="right">
      <ConfirmDeleteButton header="Delete Project" name={name} onDelete={onDelete} />
      <Button icon="edit" labelPosition="left" content="Open" onClick={onOpen} color="orange" />
    </Card.Content>
  </Card>
);

ProjectItem.propTypes = {
  name: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onOpen: () => dispatch(requestOpenProject(projectId)),
  onDelete: () => dispatch(requestDeleteProject(projectId)),
});

export default connect(null, mapDispatchToProps)(ProjectItem);
