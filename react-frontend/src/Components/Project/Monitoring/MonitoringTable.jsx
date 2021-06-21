import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Header,
  Icon,
  Accordion,
} from 'semantic-ui-react';
import DeviceHeader from './DeviceHeader';
import ControlsSection from './ControlsSection';
import AudioObjectsRow from './AudioObjectsRow';
import {
  useCurrentSetup,
} from './helpers';

const MonitoringTable = ({
  projectId,
  sequenceId,
}) => {
  const [controlsOpen, setControlsOpen] = useState(true);

  const currentSetup = useCurrentSetup(projectId);
  return (
    // Set a currentState constant to be the currentState in state
    <Table celled unstackable>
      <Table.Header>
        <DeviceHeader
          projectId={projectId}
          sequenceId={sequenceId}
        />
        <Table.Row>
          <Table.HeaderCell colSpan={currentSetup.length + 1}>
            <Accordion
              exclusive={false}
              fluid
            >
              <Accordion.Title
                active={controlsOpen}
                onClick={() => setControlsOpen(!controlsOpen)}
              >
                <Header as="h5">
                  <Header.Content content="Controls" />
                  <Icon name="dropdown" />
                </Header>
              </Accordion.Title>
            </Accordion>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {controlsOpen && <ControlsSection projectId={projectId} sequenceId={sequenceId} />}
        <AudioObjectsRow projectId={projectId} />
      </Table.Body>
    </Table>
  );
};

MonitoringTable.propTypes = {
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
};

export default MonitoringTable;
