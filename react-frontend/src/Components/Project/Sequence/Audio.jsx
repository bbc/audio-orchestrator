import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Header,
  Icon,
  Segment,
  Table,
  Dimmer,
  Loader,
  Label,
} from 'semantic-ui-react';
import AudioFileRow from './AudioFileRow';
import {
  requestReplaceAllAudioFiles,
} from '../../../actions/project';

const Audio = ({
  filesList,
  projectId,
  sequenceId,
  loading,
  loadingCompleted,
  loadingTotal,
  onReplaceAll,
  sequenceAudioError,
  sequenceAudioConfirmation,
}) => {
  if (!loading && filesList.length === 0) {
    return (
      <Segment attached placeholder textAlign="center">
        <Header icon>
          <Icon name="file audio outline" />
          Add audio
          <Header.Subheader>
            There should be one continuous mono WAV file for each object.
          </Header.Subheader>
        </Header>
        <Button primary icon="linkify" content="Link audio files" onClick={onReplaceAll} />
        { sequenceAudioError
          ? (
            <div>
              <Label pointing="above" basic color="red" content={sequenceAudioError} />
            </div>
          )
          : null
        }
      </Segment>
    );
  }

  return (
    <Segment attached>
      <Dimmer active={loading} inverted verticalAlign="top">
        { !loadingTotal
          ? <Loader indeterminate inline="centered" content="Checking Audio Files" />
          : <Loader inline="centered" content={`Checking Audio Files (${loadingCompleted}/${loadingTotal})`} />
        }
      </Dimmer>
      <Table collapsing>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>File</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading ? null : filesList.map(({ name, fileId }) => (
            <AudioFileRow
              key={fileId}
              name={name}
              projectId={projectId}
              sequenceId={sequenceId}
              fileId={fileId}
            />
          ))}
        </Table.Body>
      </Table>
      <Button
        primary
        icon="linkify"
        content="Replace audio files"
        onClick={onReplaceAll}
        label={(sequenceAudioError || sequenceAudioConfirmation) ? {
          as: 'a',
          basic: true,
          color: sequenceAudioError ? 'red' : 'green',
          content: sequenceAudioError || sequenceAudioConfirmation,
          pointing: 'left',
          icon: sequenceAudioError ? '' : 'checkmark',
        } : null}
      />
    </Segment>
  );
};

Audio.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadingCompleted: PropTypes.number,
  loadingTotal: PropTypes.number,
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  filesList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onReplaceAll: PropTypes.func.isRequired,
  sequenceAudioConfirmation: PropTypes.string,
  sequenceAudioError: PropTypes.string,
};

Audio.defaultProps = {
  loadingCompleted: 0,
  loadingTotal: 0,
  sequenceAudioConfirmation: null,
  sequenceAudioError: null,
};

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const { sequences } = state.Project.projects[projectId];
  const {
    filesLoading,
    filesTaskId,
    filesList,
  } = sequences[sequenceId];

  const { total, completed } = state.UI.tasks[filesTaskId] || {};

  const {
    sequenceAudioConfirmation,
    sequenceAudioError,
  } = state.UI;

  return {
    loading: filesLoading,
    loadingTotal: total,
    loadingCompleted: completed,
    filesList,
    sequenceAudioConfirmation,
    sequenceAudioError,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onReplaceAll: () => dispatch(requestReplaceAllAudioFiles(projectId, sequenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Audio);
