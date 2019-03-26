import React from 'react';
import {
  Segment,
  Card,
  Message,
} from 'semantic-ui-react';
import ImageCard from './ImageCard';

const Metadata = () => (
  <Segment attached>
    <Message positive icon="checkmark" header="No images referenced" content="The metadata file does not reference any images. Add image names in the metadata and reload the metadata file to add them." />

    <Card.Group itemsPerRow={4}>
      <ImageCard />
      <ImageCard src="http://placekitten.com/g/400/400" />
      <ImageCard src="http://placekitten.com/g/300/250" />
    </Card.Group>
  </Segment>
);

export default Metadata;
