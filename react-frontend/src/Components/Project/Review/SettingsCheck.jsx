import React from 'react';
import { connect } from 'react-redux';
import {
  Table,
  Header,
  Button,
} from 'semantic-ui-react';

const SettingsCheck = ({
  name,
  error,
  valid,
  onReview,
}) => (
  <Table.Row positive={!!valid} negative={!valid}>
    <Table.Cell icon={valid ? 'checkmark' : 'exclamation circle'} />
    <Table.Cell>
      <Header as="h4" content={name} />
      {valid ? 'Valid.' : (error || 'Invalid settings detected.')}
    </Table.Cell>
    <Table.Cell>
      {!valid && !!onReview
        ? <Button content="Review" icon="edit" labelPosition="left" onClick={onReview} />
        : null
      }
    </Table.Cell>
  </Table.Row>
);

export default SettingsCheck;
