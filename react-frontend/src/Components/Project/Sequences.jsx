import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Message,
  Button,
  Divider,
} from 'semantic-ui-react';
import SequencesList from './SequencesList';
import Sequence from './Sequence';

import {
  requestAddSequence,
} from '../../actions/project';

const Sequences = ({
  projectId,
  currentSequenceId,
  onAddSequence,
}) => {
  if (currentSequenceId === null) {
    return (
      <Container>
        <Message icon="lightbulb outline" header="Sequence audio and metadata" content="Each sequence is an independent section of content. Add metadata and audio files, and define links to other sequences." />
        <SequencesList projectId={projectId} />
        <Divider hidden />
        <Button primary icon="plus" content="Add Sequence" onClick={onAddSequence} labelPosition="left" />
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
  onAddSequence: PropTypes.func.isRequired,
};

Sequences.defaultProps = {
  currentSequenceId: null,
};

const mapStateToProps = (state) => {
  const { currentSequenceId } = state.UI;

  return {
    currentSequenceId,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onAddSequence: () => dispatch(requestAddSequence(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sequences);
