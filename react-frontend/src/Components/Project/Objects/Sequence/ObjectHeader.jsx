import React from 'react';
import {
  Table,
} from 'semantic-ui-react';

const ObjectHeader = () => (
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell content="#" collapsing />
      <Table.HeaderCell content="Audio file" collapsing />
      <Table.HeaderCell content="Panning" collapsing />
      <Table.HeaderCell content="Behaviours" />
      <Table.HeaderCell content="Actions" collapsing />
    </Table.Row>
  </Table.Header>
);

export default ObjectHeader;
