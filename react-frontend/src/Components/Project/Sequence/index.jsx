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
import Settings from './Settings';
import EditableMenuHeader from '../EditableMenuHeader';
import { setSequenceSetting } from '../../../actions/project';

import {
  PAGE_SEQUENCE_AUDIO,
  PAGE_SEQUENCE_METADATA,
  PAGE_SEQUENCE_IMAGES,
  PAGE_SEQUENCE_SETTINGS,
} from '../../../reducers/UIReducer';

import {
  openSequencePage,
  closeSequencePage,
} from '../../../actions/ui';

const Sequence = ({
  sequenceId,
  projectId,
  name,
  onSetName,
  onCloseSequence,
  onOpenSequencePage,
  currentSequencePage,
}) => {
  let CurrentStep;
  switch (currentSequencePage) {
    case PAGE_SEQUENCE_AUDIO:
      CurrentStep = Audio;
      break;
    case PAGE_SEQUENCE_METADATA:
      CurrentStep = Metadata;
      break;
    case PAGE_SEQUENCE_IMAGES:
      CurrentStep = Images;
      break;
    case PAGE_SEQUENCE_SETTINGS:
      CurrentStep = Settings;
      break;
    default:
      throw new Error(`currentSequencePage is invalid (${currentSequencePage})`);
  }

  return (
    <Container>
      <Menu inverted color="green" attached="top">
        <EditableMenuHeader value={name} onChange={onSetName} />
        <Menu.Item position="right" icon="close" content="close" onClick={onCloseSequence} />
      </Menu>

      <Step.Group widths={4} attached="top">
        <Step
          link
          active={currentSequencePage === PAGE_SEQUENCE_AUDIO}
          icon="file audio outline"
          title="Audio"
          description="Import audio files"
          onClick={() => onOpenSequencePage(PAGE_SEQUENCE_AUDIO)}
        />
        <Step
          link
          active={currentSequencePage === PAGE_SEQUENCE_METADATA}
          icon="file code outline"
          title="Metadata"
          description="Add and review metadata"
          onClick={() => onOpenSequencePage(PAGE_SEQUENCE_METADATA)}
        />
        <Step
          active={currentSequencePage === PAGE_SEQUENCE_IMAGES}
          icon="file image outline"
          title="Images"
          description="Add artwork images"
          onClick={() => onOpenSequencePage(PAGE_SEQUENCE_IMAGES)}
        />
        <Step
          active={currentSequencePage === PAGE_SEQUENCE_SETTINGS}
          icon="cog"
          title="Settings"
          description="Set looping and branching behaviour"
          onClick={() => onOpenSequencePage(PAGE_SEQUENCE_SETTINGS)}
        />
      </Step.Group>
      <CurrentStep projectId={projectId} sequenceId={sequenceId} />
    </Container>
  );
};

Sequence.propTypes = {
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onCloseSequence: PropTypes.func.isRequired,
  onSetName: PropTypes.func.isRequired,
  onOpenSequencePage: PropTypes.func.isRequired,
  currentSequencePage: PropTypes.string.isRequired,
};

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const project = state.Project.projects[projectId];
  const { name } = project.sequences[sequenceId];
  const { currentSequencePage } = state.UI;

  return ({
    name,
    currentSequencePage,
  });
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onSetName: name => dispatch(setSequenceSetting(projectId, sequenceId, 'name', name)),
  onOpenSequencePage: page => dispatch(openSequencePage(projectId, sequenceId, page)),
  onCloseSequence: () => dispatch(closeSequencePage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sequence);
