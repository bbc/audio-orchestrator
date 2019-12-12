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

import {
  requestAddSequence,
} from '../../../actions/project';

const Sequences = ({
  projectId,
  onAddSequence,
}) => (
  <Container>
    <Message icon="lightbulb outline" header="Sequence audio and metadata" content="Each sequence is an independent section of content. Add metadata and audio files, and define links to other sequences." />
    <SequencesList projectId={projectId} />
    <Divider hidden />
    <Button primary icon="plus" content="Add Sequence" onClick={onAddSequence} labelPosition="left" />
  </Container>
);

Sequences.propTypes = {
  projectId: PropTypes.string.isRequired,
  onAddSequence: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onAddSequence: () => dispatch(requestAddSequence(projectId)),
});

export default connect(null, mapDispatchToProps)(Sequences);
