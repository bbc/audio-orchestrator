import React from 'react';
// import PropTypes from 'prop-types';
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
  projectId,
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

//    <Card.Content extra>
//      <Icon loading name="spinner" />
//      Encoding audio segments&hellip;
//    </Card.Content>
//    <Progress percent={74} attached="bottom" color="green" />
const mapDispatchToProps = (dispatch, { projectId }) => ({
  onOpen: () => dispatch(requestOpenProject(projectId)),
  onDelete: () => dispatch(requestDeleteProject(projectId)),
});

export default connect(null, mapDispatchToProps)(ProjectItem);
