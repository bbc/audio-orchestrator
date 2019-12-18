import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
} from 'semantic-ui-react';

import SequenceHeader from './SequenceHeader';
import SequenceObjectTable from './SequenceObjectTable';

const Sequence = ({
  sequenceId,
  projectId,
}) => (
  <div>
    <SequenceHeader {...{ sequenceId, projectId }} />
    <SequenceObjectTable {...{ sequenceId, projectId }} />
  </div>
);

Sequence.propTypes = {
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
};

export default Sequence;
