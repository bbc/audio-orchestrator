import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Dropdown,
  Table,
  Icon,
  Popup,
} from 'semantic-ui-react';

const channelConfigurationOptions = [
  {
    key: 'stereo',
    text: 'Stereo',
    value: 'stereo',
    disabled: true,
  },
  {
    key: 'left',
    text: 'Left',
    value: 'left',
  },
  {
    key: 'right',
    text: 'Right',
    value: 'right',
  },
  {
    key: 'mono',
    text: 'Mono',
    value: 'mono',
  },
];

const AnalysisLoader = <Icon name="ellipsis horizontal" />;

// TODO: format duration and sample rate
const AudioFileRow = ({
  name,
  numChannels,
  sampleRate,
  duration,
  channelConfiguration,
  error,
}) => {
  return (
    <Table.Row negative={!!error}>
      <Table.Cell>
        {!error
          ? <span>{name}</span>
          : (
            <Popup
              trigger={(
                <span>
                  <Icon name="exclamation" />
                  {name}
                </span>
              )}
              content={error}
            />
          )
        }
      </Table.Cell>
      <Table.Cell content={numChannels || AnalysisLoader} />
      <Table.Cell>
        {channelConfiguration
          ? (
            <Dropdown
              disabled={!channelConfiguration}
              options={channelConfigurationOptions}
              defaultValue={channelConfiguration}
            />
          ) : AnalysisLoader
        }
      </Table.Cell>
      <Table.Cell content={sampleRate || AnalysisLoader} />
      <Table.Cell content={duration || AnalysisLoader} />
    </Table.Row>
  );
};

AudioFileRow.propTypes = {
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
  numChannels: PropTypes.number,
  sampleRate: PropTypes.number,
  duration: PropTypes.number,
  channelConfiguration: PropTypes.string,
};

AudioFileRow.defaultProps = {
  error: null,
  numChannels: null,
  sampleRate: null,
  duration: null,
  channelConfiguration: null,
};

const mapStateToProps = (state, { projectId, sequenceId, fileId }) => {
  const sequence = state.Project.projects[projectId].sequences[sequenceId];

  // look up file info in state; if file is not yet available, pass on undefined values.
  const { probe, error } = sequence.files[fileId] || {};

  // get probe info; if not yet available, pass on undefined values to display loading indicator.
  const {
    numChannels,
    sampleRate,
    duration,
  } = probe || {};

  return {
    numChannels,
    sampleRate,
    duration,
    error,
  };
};

export default connect(mapStateToProps)(AudioFileRow);
