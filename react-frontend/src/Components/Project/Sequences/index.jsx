import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Button,
  Divider,
} from 'semantic-ui-react';
import SequencesList from './SequencesList';
import PageTitleBar from '../../PageTitleBar';


import {
  requestAddSequence,
} from '../../../actions/project';

const Sequences = ({
  projectId,
  onAddSequence,
}) => (
  <Container>
    <PageTitleBar
      title="Sequence audio and metadata"
      shortDescription="Each sequence is an independent section of content. Add metadata and audio files, and define links to other sequences."
      helpId="sequences"
    />
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
