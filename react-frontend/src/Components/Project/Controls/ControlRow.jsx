import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
} from 'semantic-ui-react';
import EditableText from '../EditableText';
import ConfirmDeleteButton from '../../ConfirmDeleteButton';
import controlTypes from './controlTypes';

const ControlRow = React.memo(({
  controlName,
  controlType,
  onDelete,
  onChange,
}) => (
  <Table.Row>
    <Table.Cell>
      <EditableText
        value={controlName}
        onChange={value => onChange('controlName', value)}
      />
      <br />
      {(controlTypes.find(({ name }) => name === controlType) || {}).displayName || controlType}
    </Table.Cell>
    <Table.Cell>todo parameters...</Table.Cell>
    <Table.Cell>todo behaviours...</Table.Cell>
    <Table.Cell>
      <ConfirmDeleteButton
        header={`Delete ${controlType} control`}
        name={controlName}
        onDelete={onDelete}
      />
    </Table.Cell>
  </Table.Row>
));

ControlRow.propTypes = {
  controlName: PropTypes.string.isRequired,
  controlType: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ControlRow;
