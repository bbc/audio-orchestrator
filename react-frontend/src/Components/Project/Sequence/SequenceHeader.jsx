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
} from 'semantic-ui-react';

import {
  requestReplaceMetadata,
  requestReplaceAllAudioFiles,
} from '../../../actions/project';

import {
  setTableExpanded,
} from '../../../actions/ui';

const SequenceHeader = ({
  haveMetadata,
  haveFiles,
  onReplaceMetadata,
  onReplaceAudioFiles,
  sequenceAudioError,
  sequenceAudioConfirmation,
  sequenceMetadataError,
  sequenceMetadataConfirmation,
  expandTable,
  onSetExpanded,
}) => {
  if (!haveFiles) {
    return (
      <Segment placeholder>
        <Header icon>
          <Icon name="file audio outline" />
          Audio files
          <Header.Subheader>
            There should be one continuous mono WAV file for each object.
          </Header.Subheader>
        </Header>
        <Button
          primary
          icon="linkify"
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
        icon="linkify"
        content="Replace audio files"
        onClick={onReplaceAudioFiles}
      />
      <Button
        icon="folder open"
        content="Import metadata file"
        onClick={onReplaceMetadata}
      />

      { expandTable
        ? <Button icon="compress" content="simplify table" onClick={() => onSetExpanded(false)} />
        : <Button icon="expand" content="expand table" onClick={() => onSetExpanded(true)} />
      }

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

      { (sequenceMetadataError || sequenceMetadataConfirmation)
        ? (
          <Label
            basic
            color={sequenceMetadataError ? 'red' : 'green'}
            content={sequenceMetadataError || sequenceMetadataConfirmation}
            icon={sequenceMetadataError ? 'exclamation' : 'checkmark'}
          />
        )
        : null
      }
    </Container>
  );
};

SequenceHeader.propTypes = {
  haveMetadata: PropTypes.bool.isRequired,
  haveFiles: PropTypes.bool.isRequired,
  sequenceAudioError: PropTypes.string,
  sequenceAudioConfirmation: PropTypes.string,
  sequenceMetadataError: PropTypes.string,
  sequenceMetadataConfirmation: PropTypes.string,
  onReplaceMetadata: PropTypes.func.isRequired,
  onReplaceAudioFiles: PropTypes.func.isRequired,
  expandTable: PropTypes.bool.isRequired,
  onSetExpanded: PropTypes.func.isRequired,
};

SequenceHeader.defaultProps = {
  sequenceMetadataConfirmation: null,
  sequenceMetadataError: null,
  sequenceAudioConfirmation: null,
  sequenceAudioError: null,
};

const mapStateToProps = ({ Project, UI }, { projectId, sequenceId }) => {
  const project = Project.projects[projectId];
  const { sequences } = project;
  const {
    filesList,
    objectsList,
  } = sequences[sequenceId];

  const {
    sequenceMetadataConfirmation,
    sequenceMetadataError,
    sequenceAudioError,
    sequenceAudioConfirmation,
    expandTable,
  } = UI;

  return {
    haveMetadata: (objectsList && objectsList.length > 0),
    haveFiles: (filesList && filesList.length > 0),
    sequenceAudioConfirmation,
    sequenceAudioError,
    sequenceMetadataConfirmation,
    sequenceMetadataError,
    expandTable,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onReplaceMetadata: () => dispatch(requestReplaceMetadata(projectId, sequenceId)),
  onReplaceAudioFiles: () => dispatch(requestReplaceAllAudioFiles(projectId, sequenceId)),
  onSetExpanded: expanded => dispatch(setTableExpanded(expanded)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceHeader);
