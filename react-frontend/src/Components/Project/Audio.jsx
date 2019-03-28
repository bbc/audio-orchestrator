import React from 'react';
import {
  Button,
  Divider,
  Header,
  Dropdown,
  Segment,
  Table,
  Icon,
} from 'semantic-ui-react';

// Placeholder before files added
// const Audio = () => (
//   <Segment attached placeholder textAlign="center">
//     <Header>No audio files added yet.</Header>
//     Drag and drop your audio files here to add them to this project.
//     <Divider />
//     <Button primary icon="plus" content="Select audio files" />
//   </Segment>
// );

const channelConfigurationOptions = [
  {
    key: 'stereo',
    text: 'Stereo',
    value: 'stereo',
    disabled: true,
  },
  {
    key: 'left',
    text: 'Left',
    value: 'left',
  },
  {
    key: 'right',
    text: 'Right',
    value: 'right',
  },
  {
    key: 'mono',
    text: 'Mono',
    value: 'mono',
  },
];

const Audio = () => (
  <Segment attached>
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>File</Table.HeaderCell>
          <Table.HeaderCell>Channels</Table.HeaderCell>
          <Table.HeaderCell>Channel Configuration</Table.HeaderCell>
          <Table.HeaderCell>Sample Rate</Table.HeaderCell>
          <Table.HeaderCell>Duration</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>000_Foo_L.wav</Table.Cell>
          <Table.Cell>1</Table.Cell>
          <Table.Cell>
            <Dropdown options={channelConfigurationOptions} defaultValue="left" />
          </Table.Cell>
          <Table.Cell>48,000</Table.Cell>
          <Table.Cell>04:30</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>001_Foo_R.wav</Table.Cell>
          <Table.Cell>1</Table.Cell>
          <Table.Cell>
            <Dropdown options={channelConfigurationOptions} defaultValue="right" />
          </Table.Cell>
          <Table.Cell>48,000</Table.Cell>
          <Table.Cell>04:30</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>002_Bar_M.wav</Table.Cell>
          <Table.Cell>1</Table.Cell>
          <Table.Cell>
            <Dropdown options={channelConfigurationOptions} defaultValue="mono" />
          </Table.Cell>
          <Table.Cell>48,000</Table.Cell>
          <Table.Cell>04:30</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>003_OtherBar_M.wav</Table.Cell>
          <Table.Cell>1</Table.Cell>
          <Table.Cell>
            <Dropdown options={channelConfigurationOptions} defaultValue="mono" />
          </Table.Cell>
          <Table.Cell>48,000</Table.Cell>
          <Table.Cell>04:30</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
    <Button.Group>
      <Button primary icon="plus" content="Add audio files" />
      <Button content="Proceed to Metadata" icon="right arrow" labelPosition="right" />
    </Button.Group>
  </Segment>
);

export default Audio;
