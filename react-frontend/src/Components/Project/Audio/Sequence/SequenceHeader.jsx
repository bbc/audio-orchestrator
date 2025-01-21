import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Segment,
  Icon,
  Header,
  Label,
  List,
  Menu,
} from 'semantic-ui-react';

import {
  requestReplaceAllAudioFiles,
} from '#Actions/project.js';
import {
  openMonitoringPage,
} from '#Actions/ui.js';
import { useObjects } from '#Components/Project/Monitoring/helpers.js';
import ConnectToDAWButton from '#Components/Project/Monitoring/ConnectToDAWButton.jsx';
import PlayPauseButtons from '#Components/Project/Monitoring/PlayPauseButtons.jsx';
import RunAlgorithmButton from '#Components/Project/Monitoring/RunAlgorithmButton.jsx';

function SequenceHeader({
  haveFiles,
  onReplaceAudioFiles,
  onOpenMonitoring,
  sequenceAudioError,
  sequenceAudioConfirmation,
  projectId,
  sequenceId,
}) {
  // To pass as a prop to connect to DAW button
  const objects = useObjects(projectId, sequenceId);
  if (!haveFiles) {
    return (
      <Segment placeholder>
        <Header icon>
          <Icon name="file audio outline" />
          Add audio files to this sequence.
          <Header.Subheader>
            <List bulleted style={{ textAlign: 'left', display: 'inline-block' }}>
              <List.Item content="There must be one continuous mono or stereo .wav file for each object." />
              <List.Item content="All files must be the same length." />
              <List.Item content="Filenames must start wih ascending numbers, e.g. 01_example.wav." />
            </List>
          </Header.Subheader>
        </Header>
        <Button
          primary
          labelPosition="left"
          icon="open folder"
          content="Add audio files"
          onClick={onReplaceAudioFiles}
        />
      </Segment>
    );
  }

  return (
    <Menu secondary>
      <Menu.Item>
        <Button
          primary
          labelPosition="left"
          icon="open folder"
          content="Replace all audio files"
          onClick={onReplaceAudioFiles}
        />

        {(sequenceAudioError || sequenceAudioConfirmation)
          ? (
            <Label
              basic
              color={sequenceAudioError ? 'red' : 'green'}
              content={sequenceAudioError || sequenceAudioConfirmation}
              icon={sequenceAudioError ? 'exclamation' : 'checkmark'}
            />
          )
          : null}
      </Menu.Item>
      <Menu.Menu position="right">
        <Menu.Item>
          <ConnectToDAWButton
            objects={objects}
            projectId={projectId}
          />
        </Menu.Item>
        <Menu.Item>
          <Button.Group basic>
            <PlayPauseButtons />
            <RunAlgorithmButton
              projectId={projectId}
              currentSequenceId={sequenceId}
            />
          </Button.Group>
        </Menu.Item>
        <Menu.Item>
          <Button
            compact
            basic
            icon="headphones"
            className="icon"
            content="Monitoring"
            labelPosition="left"
            onClick={onOpenMonitoring}
          />
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  );
}

SequenceHeader.propTypes = {
  haveFiles: PropTypes.bool.isRequired,
  sequenceAudioError: PropTypes.string,
  sequenceAudioConfirmation: PropTypes.string,
  onReplaceAudioFiles: PropTypes.func.isRequired,
  onOpenMonitoring: PropTypes.func.isRequired,
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
};

SequenceHeader.defaultProps = {
  sequenceAudioConfirmation: null,
  sequenceAudioError: null,
};

const mapStateToProps = ({ Project, UI }, { projectId, sequenceId }) => {
  const project = Project.projects[projectId];
  const { sequences } = project;
  const {
    filesList,
  } = sequences[sequenceId];

  const {
    sequenceAudioError,
    sequenceAudioConfirmation,
  } = UI;

  return {
    haveFiles: (filesList && filesList.length > 0),
    sequenceAudioConfirmation,
    sequenceAudioError,
    projectId,
    sequenceId,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onReplaceAudioFiles: () => dispatch(requestReplaceAllAudioFiles(projectId, sequenceId)),
  onOpenMonitoring: () => dispatch(openMonitoringPage(projectId, sequenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceHeader);
