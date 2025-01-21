import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Checkbox,
  // Button,
} from 'semantic-ui-react';

import ConfirmDeleteButton from '#Components/ConfirmDeleteButton.jsx';
import AddBehaviourButton from './AddBehaviourButton.jsx';

function ObjectHeader({
  indeterminate,
  checked,
  usedBehaviourTypes,
  controls,
  onToggleAllHighlights,
  onDeleteHighlighted,
  onAddBehaviourToHighlighted,
}) {
  const actionsEnabled = checked || indeterminate;

  return (
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell colSpan="4">
          <AddBehaviourButton
            disabled={!actionsEnabled}
            text="Add behaviour"
            onAddBehaviour={onAddBehaviourToHighlighted}
            usedBehaviourTypes={usedBehaviourTypes}
            controls={controls}
          />
        </Table.HeaderCell>
        <Table.HeaderCell collapsing>
          <ConfirmDeleteButton
            disabled={!actionsEnabled}
            type="selected objects"
            onDelete={onDeleteHighlighted}
            small
          />
        </Table.HeaderCell>
      </Table.Row>
      <Table.Row>
        <Table.HeaderCell collapsing singleLine>
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={onToggleAllHighlights}
          />
        </Table.HeaderCell>
        <Table.HeaderCell content="Object name" collapsing />
        <Table.HeaderCell content="Panning" collapsing />
        <Table.HeaderCell content="Behaviours" colSpan="2" />
      </Table.Row>
    </Table.Header>
  );
}

//          <Button
//            disabled={!actionsEnabled}
//            content="Add preset"
//            icon="plus"
//            labelPosition="left"
//            size="tiny"
//            primary
//            compact
//          />
//          <Button
//            disabled={!actionsEnabled}
//            content="Add custom"
//            icon="plus"
//            labelPosition="left"
//            size="tiny"
//            primary
//            compact
//          />
//          <Button
//            disabled={!actionsEnabled}
//            content="Copy from..."
//            icon="copy"
//            labelPosition="left"
//            size="tiny"
//            primary
//            compact
//          />

ObjectHeader.propTypes = {
  indeterminate: PropTypes.bool,
  checked: PropTypes.bool,
  usedBehaviourTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  onToggleAllHighlights: PropTypes.func.isRequired,
  onDeleteHighlighted: PropTypes.func.isRequired,
  onAddBehaviourToHighlighted: PropTypes.func.isRequired,
};

ObjectHeader.defaultProps = {
  indeterminate: false,
  checked: false,
  controls: [],
};

export default ObjectHeader;
