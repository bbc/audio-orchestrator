import React from 'react';
import {
  Button,
  Dropdown,
  Segment,
  Table,
  Message,
} from 'semantic-ui-react';

const dummyFileNameOptions = [
  {
    value: '000_Foo_L.wav',
    text: '000_Foo_L.wav',
  },
  {
    value: '001_Foo_R.wav',
    text: '001_Foo_R.wav',
  },
  {
    value: '002_Bar_M.wav',
    text: '002_Bar_M.wav',
  },
  {
    value: '003_Other_Bar_M.wav',
    text: '003_Other_Bar_M.wav',
  },
];

// Placeholder before files added
// const Audio = () => (
//   <Segment attached placeholder textAlign="center">
//     <Header>No metadata file added yet.</Header>
//     Drag and drop your metadata file here to add it to this project.
//     <Divider />
//     <Button primary icon="plus" content="Select metadata file" />
//   </Segment>
// );

const Metadata = () => (
  <Segment attached>
    <Message
      icon="exclamation"
      error
      header="Metadata does not match audio files"
      content="There are more entries in the metadata than there are audio files. Please replace the metadata file or add the missing audio files on the previous page."
    />
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>#</Table.HeaderCell>
          <Table.HeaderCell>Object Label</Table.HeaderCell>
          <Table.HeaderCell>Associated audio file</Table.HeaderCell>
          <Table.HeaderCell>Image</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>1</Table.Cell>
          <Table.Cell>Foo_L</Table.Cell>
          <Table.Cell>
            <Dropdown search selection options={dummyFileNameOptions} defaultValue="000_Foo_L.wav" />
          </Table.Cell>
          <Table.Cell>foo</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>2</Table.Cell>
          <Table.Cell>Foo_R</Table.Cell>
          <Table.Cell>
            <Dropdown search selection options={dummyFileNameOptions} defaultValue="001_Foo_R.wav" />
          </Table.Cell>
          <Table.Cell>foo</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>3</Table.Cell>
          <Table.Cell>Bar</Table.Cell>
          <Table.Cell>
            <Dropdown search selection options={dummyFileNameOptions} value="003_Other_Bar_M.wav" />
            <Button attached="right" icon="undo" />
          </Table.Cell>
          <Table.Cell>foo</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>4</Table.Cell>
          <Table.Cell>Other_Bar</Table.Cell>
          <Table.Cell>
            <Dropdown search selection options={dummyFileNameOptions} defaultValue="003_Other_Bar_M.wav" />
          </Table.Cell>
          <Table.Cell>foo</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
    <Button.Group>
      <Button primary icon="plus" content="Replace metadata file" labelPosition="left" />
      <Button content="Proceed to Images" icon="right arrow" labelPosition="right" />
    </Button.Group>
  </Segment>
);

export default Metadata;
