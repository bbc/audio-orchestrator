import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Message,
} from 'semantic-ui-react';
import SequencesList from './SequencesList';
import Sequence from './Sequence';

const Sequences = ({
  projectId,
  currentSequenceId,
}) => {
  if (currentSequenceId === null) {
    return (
      <Container>
        <Message icon="lightbulb outline" header="Sequence audio and metadata" content="Each sequence is an independent section of content, corresponding to one DAW session." onDismiss={() => {}} />
        <SequencesList projectId={projectId} />
      </Container>
    );
  }

  return (
    <Sequence
      projectId={projectId}
      sequenceId={currentSequenceId}
    />
  );
};

Sequences.propTypes = {
  projectId: PropTypes.string.isRequired,
  currentSequenceId: PropTypes.string,
};

Sequences.defaultProps = {
  currentSequenceId: null,
};

const mapDispatchToProps = (state) => {
  const { currentSequenceId } = state.UI;

  return {
    currentSequenceId,
  };
};

export default connect(mapDispatchToProps)(Sequences);
