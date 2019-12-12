import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Table,
  Icon,
  Popup,
} from 'semantic-ui-react';


// TODO: format duration and sample rate
const AudioFileRow = ({
  name,
  error,
}) => (
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
  </Table.Row>
);

AudioFileRow.propTypes = {
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
};

AudioFileRow.defaultProps = {
  error: null,
};

const mapStateToProps = (state, { projectId, sequenceId, fileId }) => {
  const sequence = state.Project.projects[projectId].sequences[sequenceId];

  // look up file info in state; if file is not yet available, pass on undefined values.
  const { error } = sequence.files[fileId] || {};

  return {
    error,
  };
};

export default connect(mapStateToProps)(AudioFileRow);
