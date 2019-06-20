import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Segment,
  Icon,
  Header,
  Grid,
  Divider,
  Label,
} from 'semantic-ui-react';

import {
  requestReplaceMetadata,
  requestReplaceAllAudioFiles,
} from '../../../actions/project';

const SequenceHeader = ({
  haveMetadata,
  haveFiles,
  onReplaceMetadata,
  onReplaceAudioFiles,
  sequenceAudioError,
  sequenceAudioConfirmation,
  sequenceMetadataError,
  sequenceMetadataConfirmation,
}) => (
  <Segment attached placeholder>
    <Divider vertical content="and" />
    <Grid columns={2} textAlign="center">
      <Grid.Column>
        <Header icon>
          <Icon name="file code outline" />
          Import Metadata
          <Header.Subheader content="The metadata file should have an entry for every object, where the object number corresponds to an audio file." />
        </Header>
        <Button
          primary
          icon="folder open"
          content={`${haveMetadata ? 'Replace' : 'Add'} metadata file`}
          onClick={onReplaceMetadata}
        />
        { (sequenceMetadataError || sequenceMetadataConfirmation)
          ? (
            <Label
              basic
              pointing="above"
              color={sequenceMetadataError ? 'red' : 'green'}
              content={sequenceMetadataError || sequenceMetadataConfirmation}
              icon={sequenceMetadataError ? 'exclamation' : 'checkmark'}
            />
          )
          : null
        }
      </Grid.Column>
      <Grid.Column>
        <Header icon>
          <Icon name="file audio outline" />
          Link Audio files
          <Header.Subheader>
            There should be one continuous mono WAV file for each object.
          </Header.Subheader>
        </Header>
        <Button
          primary
          icon="linkify"
          content={`${haveFiles ? 'Replace' : 'Add'} audio files`}
          onClick={onReplaceAudioFiles}
        />
        { (sequenceAudioError || sequenceAudioConfirmation)
          ? (
            <Label
              basic
              pointing="above"
              color={sequenceAudioError ? 'red' : 'green'}
              content={sequenceAudioError || sequenceAudioConfirmation}
              icon={sequenceAudioError ? 'exclamation' : 'checkmark'}
            />
          )
          : null
        }
      </Grid.Column>
    </Grid>
  </Segment>
);

SequenceHeader.propTypes = {
  haveMetadata: PropTypes.bool.isRequired,
  haveFiles: PropTypes.bool.isRequired,
  sequenceAudioError: PropTypes.string,
  sequenceAudioConfirmation: PropTypes.string,
  sequenceMetadataError: PropTypes.string,
  sequenceMetadataConfirmation: PropTypes.string,
  onReplaceMetadata: PropTypes.func.isRequired,
  onReplaceAudioFiles: PropTypes.func.isRequired,
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
  } = UI;

  return {
    haveMetadata: (objectsList && objectsList.length > 0),
    haveFiles: (filesList && filesList.length > 0),
    sequenceAudioConfirmation,
    sequenceAudioError,
    sequenceMetadataConfirmation,
    sequenceMetadataError,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onReplaceMetadata: () => dispatch(requestReplaceMetadata(projectId, sequenceId)),
  onReplaceAudioFiles: () => dispatch(requestReplaceAllAudioFiles(projectId, sequenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceHeader);
