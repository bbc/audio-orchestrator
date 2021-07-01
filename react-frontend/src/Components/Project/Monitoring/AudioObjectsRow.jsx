import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Header,
} from 'semantic-ui-react';
import { useCurrentSetup, useAlgorithmResults } from './helpers';
import AudioObjectsCell from './AudioObjectsCell';

const AudioObjectsRow = ({ projectId }) => {
  const currentSetup = useCurrentSetup(projectId);
  const { allocations } = useAlgorithmResults();
  return (
    <Table.Row>
      <Table.Cell verticalAlign="top" width={1}>
        <Header as="h5" content="Allocated objects" />
      </Table.Cell>
      {currentSetup.map(({ deviceId }) => (
        <AudioObjectsCell key={deviceId} allocatedObjects={allocations[deviceId] || []} />
      ))}
    </Table.Row>
  );
};

AudioObjectsRow.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default AudioObjectsRow;
