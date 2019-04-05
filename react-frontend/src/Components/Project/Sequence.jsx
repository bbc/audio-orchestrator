import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Step,
  Menu,
} from 'semantic-ui-react';
import Audio from './Audio';
import Metadata from './Metadata';
import Images from './Images';
import EditableMenuHeader from './EditableMenuHeader';
import { setSequenceName } from '../../actions/project';

class Sequence extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentStep: 'audio' };
    this.goToAudio = () => this.setState({ currentStep: 'audio' });
    this.goToMetadata = () => this.setState({ currentStep: 'metadata' });
    this.goToImages = () => this.setState({ currentStep: 'images' });
  }

  componentDidUpdate(previousProps) {
    // When switching between sequences, always go back to the audio step as it is always available.
    const { projectId, sequenceId } = this.props;
    if (sequenceId !== previousProps.sequenceId || projectId !== previousProps.projectId) {
      this.goToAudio();
    }
  }

  render() {
    const {
      sequenceId,
      projectId,
      name,
      onClose,
      onSetName,
    } = this.props;
    const { currentStep } = this.state;

    let CurrentStep;
    switch (currentStep) {
      case 'audio':
        CurrentStep = Audio;
        break;
      case 'metadata':
        CurrentStep = Metadata;
        break;
      case 'images':
        CurrentStep = Images;
        break;
      default:
        throw new Error('currentStep is invalid');
    }

    return (
      <Container>
        <Menu inverted color="green" attached="top">
          <EditableMenuHeader value={name} onChange={onSetName} />
          <Menu.Item position="right" icon="close" content="close" onClick={onClose} />
        </Menu>

        <Step.Group widths={3} attached="top">
          <Step
            link
            active={currentStep === 'audio'}
            icon="file audio outline"
            title="Audio"
            description="Import audio files"
            onClick={this.goToAudio}
          />
          <Step
            link
            active={currentStep === 'metadata'}
            icon="file code outline"
            title="Metadata"
            description="Add and review metadata"
            onClick={this.goToMetadata}
          />
          <Step
            active={currentStep === 'images'}
            icon="file image outline"
            title="Images"
            description="Add artwork images"
            onClick={this.goToImages}
          />
        </Step.Group>
        <CurrentStep projectId={projectId} sequenceId={sequenceId} />
      </Container>
    );
  }
}

Sequence.propTypes = {
  projectId: PropTypes.number.isRequired,
  sequenceId: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSetName: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const project = state.Project.projects[projectId];
  const sequence = project.sequences[sequenceId];

  return ({
    name: sequence.name,
  });
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onSetName: name => dispatch(setSequenceName(projectId, sequenceId, name)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sequence);
