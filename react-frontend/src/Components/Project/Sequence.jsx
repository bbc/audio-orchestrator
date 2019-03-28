import React from 'react';
import {
  Container,
  Step,
} from 'semantic-ui-react';
import Audio from './Audio';
import Metadata from './Metadata';
import Images from './Images';

class Sequence extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentStep: 'audio' };
    this.goToAudio = () => this.setState({ currentStep: 'audio' });
    this.goToMetadata = () => this.setState({ currentStep: 'metadata' });
    this.goToImages = () => this.setState({ currentStep: 'images' });
  }

  render() {
    const { currentStep } = this.state;
    return (
      <Container>
        <Step.Group widths={3} attached="top">
          <Step
            link
            completed
            active={currentStep === 'audio'}
            icon="file audio outline"
            title="Audio"
            description="Import audio files"
            onClick={this.goToAudio}
          />
          <Step
            link
            completed={currentStep !== 'audio'}
            active={currentStep === 'metadata'}
            icon="file code outline"
            title="Metadata"
            description="Add and review metadata"
            onClick={this.goToMetadata}
          />
          <Step
            disabled={currentStep === 'audio'}
            link
            active={currentStep === 'images'}
            icon="file image outline"
            title="Images"
            description="Add artwork images"
            onClick={this.goToImages}
          />
        </Step.Group>
        {currentStep === 'audio'
          ? <Audio />
          : (currentStep === 'metadata'
            ? <Metadata />
            : <Images />
          )}
      </Container>
    );
  }
}

export default Sequence;
