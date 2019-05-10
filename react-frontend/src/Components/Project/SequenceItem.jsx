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
  isMain,
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
      { isMain ? <Card.Meta content="Required, represents the main story." /> : null }
      { isIntro ? <Card.Meta content="Optional, looped while setting up devices." /> : null }
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
  isMain: PropTypes.bool,
  isIntro: PropTypes.bool,
};

SequenceItem.defaultProps = {
  isMain: false,
  isIntro: false,
};

export default SequenceItem;
