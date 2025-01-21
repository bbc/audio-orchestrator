import React from 'react';
import PropTypes from 'prop-types';
import SequenceHeader from './SequenceHeader.jsx';
import SequenceObjectTable from './SequenceObjectTable.jsx';

function Sequence({
  sequenceId,
  projectId,
}) {
  return (
    <div>
      <SequenceHeader {...{ sequenceId, projectId }} />
      <SequenceObjectTable {...{ sequenceId, projectId }} />
    </div>
  );
}

Sequence.propTypes = {
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
};

export default Sequence;
