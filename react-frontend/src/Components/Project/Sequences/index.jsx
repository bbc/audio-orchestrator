import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Divider,
} from 'semantic-ui-react';
import SequencesList from './SequencesList';
import PageTitleBar from '../../PageTitleBar';

const Sequences = ({
  projectId,
}) => (
  <Container>
    <PageTitleBar
      title="Sequences"
      shortDescription="Each sequence is an independent section of content."
      helpId="sequences"
    />
    <SequencesList projectId={projectId} />
    <Divider hidden />
  </Container>
);

Sequences.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default Sequences;
