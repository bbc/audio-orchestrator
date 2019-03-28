import React from 'react';
import {
  Button,
  Divider,
  Segment,
  Header,
  Icon,
} from 'semantic-ui-react';

const ProjectsListPlaceholder = () => (
  <Segment placeholder>
    <Header icon>
      <Icon name="file outline" />
      No Projects yet.
    </Header>
    Drag and drop your DAW audio exports here to create a new project.
    <Divider />
    <Button primary icon="plus" content="Select audio files" />
  </Segment>
);

export default ProjectsListPlaceholder;
