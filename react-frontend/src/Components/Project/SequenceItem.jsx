import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
} from 'semantic-ui-react';
import ConfirmSequenceDeleteButton from './ConfirmSequenceDeleteButton';

const SequenceItem = ({
  name,
  onOpen,
  onDelete,
  sequenceId,
  isIntro,
}) => (
  <Card color="green">
    <Card.Content>
      <Card.Header content={name} />
      { isIntro ? <Card.Meta content="Initial sequence, the story begins here." /> : null }
    </Card.Content>
    <Card.Content extra textAlign="right">
      { isIntro
        ? <Button disabled icon="trash" />
        : <ConfirmSequenceDeleteButton name={name} sequenceId={sequenceId} onDelete={onDelete} />
      }
      <Button
        primary
        icon="edit"
        labelPosition="left"
        content="Edit"
        onClick={() => {
          onOpen(sequenceId);
        }}
      />
    </Card.Content>
  </Card>
);

SequenceItem.propTypes = {
  name: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  sequenceId: PropTypes.string.isRequired,
  isIntro: PropTypes.bool,
};

SequenceItem.defaultProps = {
  isIntro: false,
};

export default SequenceItem;
