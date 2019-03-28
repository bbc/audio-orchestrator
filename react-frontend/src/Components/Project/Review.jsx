import React from 'react';
import {
  Table,
  Icon,
  Container,
  Button,
} from 'semantic-ui-react';

const Review = () => (
  <Container>
    <Table basic collapsing>
      <Table.Body>
        <Table.Row positive>
          <Table.Cell icon="checkmark" />
          <Table.Cell content="Main audio and metadata" />
          <Table.Cell><Button content="Review" icon="edit" labelPosition="left" /></Table.Cell>
        </Table.Row>
        <Table.Row positive>
          <Table.Cell icon="checkmark" />
          <Table.Cell content="Loop audio and metadata" />
          <Table.Cell><Button content="Review" icon="edit" labelPosition="left" /></Table.Cell>
        </Table.Row>
        <Table.Row warning>
          <Table.Cell textAlign="center" icon="exclamation circle" />
          <Table.Cell content="Presentation settings incomplete" />
          <Table.Cell><Button content="Review" icon="edit" labelPosition="left" /></Table.Cell>
        </Table.Row>
        <Table.Row positive>
          <Table.Cell icon="checkmark" />
          <Table.Cell content="Advanced settings" />
          <Table.Cell><Button content="Review" icon="edit" labelPosition="left" /></Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell><Icon loading name="spinner" /></Table.Cell>
          <Table.Cell content="Analysing audio files (59%)." />
          <Table.Cell />
        </Table.Row>
        <Table.Row>
          <Table.Cell icon="wait" />
          <Table.Cell content="Waiting to encode audio files..." />
          <Table.Cell />
        </Table.Row>
      </Table.Body>
    </Table>

    <Button primary icon="eye" content="Start Preview" />
    <Button icon="share" content="Export" labelPosition="right" />
  </Container>
);

export default Review;
