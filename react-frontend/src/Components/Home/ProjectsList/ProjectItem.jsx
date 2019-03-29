import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  Container,
  Button,
  Progress,
  Icon,
} from 'semantic-ui-react';

import { requestOpenProject } from '../../../actions/project';

const ProjectItem = ({
  projectId,
  name,
  lastOpened,
  onOpen,
}) => (
  <Card color="orange" onClick={onOpen}>
    <Card.Content>
      <Card.Header content={name} />
      <Card.Meta content={`Last opened ${lastOpened}`} />
    </Card.Content>
    <Card.Content extra textAlign="right">
      <Button.Group>
        <Button icon="edit" labelPosition="left" content="Open" onClick={onOpen} />
      </Button.Group>
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
});

export default connect(null, mapDispatchToProps)(ProjectItem);
