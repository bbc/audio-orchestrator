import React from 'react';
// import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import {
  Card,
  Container,
  Button,
  Divider,
} from 'semantic-ui-react';

function NewProjectItem() {
  return (
    <Card>
      <Card.Content>
        <Card.Header content="New Project" />
        <Container
          textAlign="center"
          style={{
            padding: '3em 2em',
          }}
        >
          <p>Drag and drop your DAW audio exports here to create a new project.</p>
          <Divider />
          <p>
            <Button primary icon="plus" content="Select audio files" />
          </p>
        </Container>
      </Card.Content>
    </Card>
  );
}

export default NewProjectItem;
