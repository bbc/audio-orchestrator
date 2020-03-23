import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Checkbox,
} from 'semantic-ui-react';

import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';

const ObjectHeader = ({
  indeterminate,
  checked,
  onToggleAllHighlights,
  onDeleteHighlighted,
}) => (
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell collapsing singleLine>
        <Checkbox checked={checked} indeterminate={indeterminate} label="#" onChange={onToggleAllHighlights} />
      </Table.HeaderCell>
      <Table.HeaderCell content="Audio file" collapsing />
      <Table.HeaderCell content="Panning" collapsing />
      <Table.HeaderCell content="Behaviours" collapsing />
    </Table.Row>
    { checked || indeterminate
      ? (
        <Table.Row>
          <Table.HeaderCell collapsing colSpan={4}>
            <ConfirmDeleteButton small type="selected objects" onDelete={onDeleteHighlighted} />
          </Table.HeaderCell>
        </Table.Row>
      ) : null }
  </Table.Header>
);

ObjectHeader.propTypes = {
  indeterminate: PropTypes.bool,
  checked: PropTypes.bool,
  onToggleAllHighlights: PropTypes.func.isRequired,
  onDeleteHighlighted: PropTypes.func.isRequired,
};

ObjectHeader.defaultProps = {
  indeterminate: false,
  checked: false,
};

export default ObjectHeader;
