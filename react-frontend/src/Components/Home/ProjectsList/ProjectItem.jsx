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
  onOpen,
}) => (
  <Card color="orange">
    <Card.Content>
      <Card.Header content={name} />
      <Container
        textAlign="center"
        style={{
          padding: '3em 2em',
        }}
      >
        <Button.Group>
          <Button icon="edit" content="Edit" onClick={onOpen} />
          <Button icon="share" content="Export&hellip;" disabled />
        </Button.Group>
      </Container>
    </Card.Content>
    <Card.Content extra>
      <Icon loading name="spinner" />
      Encoding audio segments&hellip;
    </Card.Content>
    <Progress percent={74} attached="bottom" color="green" />
  </Card>
);

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onOpen: () => dispatch(requestOpenProject(projectId)),
});

export default connect(null, mapDispatchToProps)(ProjectItem);
