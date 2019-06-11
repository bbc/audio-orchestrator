import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
} from 'semantic-ui-react';

const SequenceItem = ({
  name,
  onOpen,
  sequenceId,
  isIntro,
}) => (
  <Card
    color="green"
    onClick={() => {
      onOpen(sequenceId);
    }}
  >
    <Card.Content>
      <Card.Header content={name} />
      { isIntro ? <Card.Meta content="Initial sequence, the story begins here." /> : null }
    </Card.Content>
    <Card.Content extra textAlign="right">
      <Button.Group>
        <Button icon="edit" labelPosition="left" content="Edit" />
      </Button.Group>
    </Card.Content>
  </Card>
);

SequenceItem.propTypes = {
  name: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  sequenceId: PropTypes.string.isRequired,
  isIntro: PropTypes.bool,
};

SequenceItem.defaultProps = {
  isIntro: false,
};

export default SequenceItem;
