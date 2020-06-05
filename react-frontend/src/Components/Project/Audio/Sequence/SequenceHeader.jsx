import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Segment,
  Container,
  Icon,
  Header,
  Label,
  List,
} from 'semantic-ui-react';

import {
  requestReplaceAllAudioFiles,
} from '../../../../actions/project';

const SequenceHeader = ({
  haveFiles,
  onReplaceAudioFiles,
  sequenceAudioError,
  sequenceAudioConfirmation,
}) => {
  if (!haveFiles) {
    return (
      <Segment placeholder>
        <Header icon>
          <Icon name="file audio outline" />
          Add audio files to this sequence.
          <Header.Subheader>
            <List bulleted style={{ textAlign: 'left', display: 'inline-block' }}>
              <List.Item content="There must be one continuous mono .wav file for each object." />
              <List.Item content="All files must be the same length." />
              <List.Item content="Filenames must start wih ascending numbers, e.g. 01_example.wav." />
            </List>
          </Header.Subheader>
        </Header>
        <Button
          primary
          labelPosition="left"
          icon="plus"
          content="Add audio files"
          onClick={onReplaceAudioFiles}
        />
      </Segment>
    );
  }

  return (
    <Container>
      <Button
        primary
        labelPosition="left"
        icon="refresh"
        content="Replace all audio files"
        onClick={onReplaceAudioFiles}
      />

      { (sequenceAudioError || sequenceAudioConfirmation)
        ? (
          <Label
            basic
            color={sequenceAudioError ? 'red' : 'green'}
            content={sequenceAudioError || sequenceAudioConfirmation}
            icon={sequenceAudioError ? 'exclamation' : 'checkmark'}
          />
        )
        : null
      }
    </Container>
  );
};

SequenceHeader.propTypes = {
  haveFiles: PropTypes.bool.isRequired,
  sequenceAudioError: PropTypes.string,
  sequenceAudioConfirmation: PropTypes.string,
  onReplaceAudioFiles: PropTypes.func.isRequired,
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
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onReplaceAudioFiles: () => dispatch(requestReplaceAllAudioFiles(projectId, sequenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceHeader);
