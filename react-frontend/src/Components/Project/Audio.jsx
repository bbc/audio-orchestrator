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
} from 'semantic-ui-react';
import AudioFileRow from './AudioFileRow';
import {
  getSequenceFiles,
  requestReplaceAllAudioFiles,
} from '../../actions/project';

class Audio extends React.Component {
  componentDidMount() {
    const { onGetAudioFiles } = this.props;
    onGetAudioFiles();
  }

  componentDidUpdate(previousProps) {
    const { sequenceId, onGetAudioFiles } = this.props;
    if (sequenceId !== previousProps.sequenceId) {
      onGetAudioFiles();
    }
  }

  render() {
    const {
      filesList,
      projectId,
      sequenceId,
      loading,
      loadingCompleted,
      loadingTotal,
      onReplaceAll,
    } = this.props;

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
          <Button primary icon="linkify" content="Link audio files" labelPosition="left" onClick={onReplaceAll} />
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
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>File</Table.HeaderCell>
              <Table.HeaderCell>Channels</Table.HeaderCell>
              <Table.HeaderCell>Channel Configuration</Table.HeaderCell>
              <Table.HeaderCell>Sample Rate</Table.HeaderCell>
              <Table.HeaderCell>Duration</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading ? null : filesList.map(({ name, fileId, channelConfiguration }) => (
              <AudioFileRow
                key={fileId}
                name={name}
                channelConfiguration={channelConfiguration}
                projectId={projectId}
                sequenceId={sequenceId}
                fileId={fileId}
              />
            ))}
          </Table.Body>
        </Table>
        <Button negative icon="refresh" content="Replace audio files" onClick={onReplaceAll} />
      </Segment>
    );
  }
}

Audio.propTypes = {
  loading: PropTypes.bool.isRequired,
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  filesList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onReplaceAll: PropTypes.func.isRequired,
  onGetAudioFiles: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const { sequences } = state.Project.projects[projectId];
  const {
    filesLoading,
    filesTaskId,
    filesList,
  } = sequences[sequenceId];

  const { total, completed } = state.UI.tasks[filesTaskId] || {};

  return {
    loading: filesLoading,
    loadingTotal: total,
    loadingCompleted: completed,
    filesList,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onReplaceAll: () => dispatch(requestReplaceAllAudioFiles(projectId, sequenceId)),
  onGetAudioFiles: () => dispatch(getSequenceFiles(projectId, sequenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Audio);
