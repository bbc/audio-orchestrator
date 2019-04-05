import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Message,
} from 'semantic-ui-react';
import SequencesList from './SequencesList';
import Sequence from './Sequence';

class Sequences extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentSequenceId: null,
    };

    this.openSequence = (sequenceId) => {
      this.setState({ currentSequenceId: sequenceId });
    };

    this.closeSequence = () => {
      this.setState({ currentSequenceId: null });
    };
  }

  render() {
    const { projectId } = this.props;
    const { currentSequenceId } = this.state;

    if (currentSequenceId === null) {
      return (
        <Container>
          <Message icon="lightbulb outline" header="Sequence audio and metadata" content="Each sequence is an independent section of content, corresponding to one DAW session. The default template supports two sequences: The intro loop is played while users connect their devices, and the main content follows once they decide to move on." onDismiss={() => {}} />
          <SequencesList projectId={projectId} onOpenSequence={this.openSequence} />
        </Container>
      );
    }

    return (
      <Sequence
        projectId={projectId}
        sequenceId={currentSequenceId}
        onClose={this.closeSequence}
      />
    );
  }
}

Sequences.propTypes = {
  projectId: PropTypes.number.isRequired,
};

export default Sequences;
