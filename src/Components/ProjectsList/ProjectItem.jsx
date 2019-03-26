import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  Container,
  Button,
  Progress,
  Icon,
  Divider,
} from 'semantic-ui-react';

import { openProject } from '../../reducers/UIReducer';

const ProjectItem = ({
  onEdit,
}) => (
  <Card color="orange">
    <Card.Content>
      <Card.Header>
        My first project
      </Card.Header>
      <Container
        textAlign="center"
        style={{
          padding: '3em 2em',
        }}
      >
        <p>64 objects added</p>
        <Divider />
        <Button.Group>
          <Button icon="edit" content="Edit" onClick={onEdit} />
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
  onEdit: () => dispatch(openProject(projectId)),
});

export default connect(null, mapDispatchToProps)(ProjectItem);
