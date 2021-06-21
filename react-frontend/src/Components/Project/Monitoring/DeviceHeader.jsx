import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Table,
} from 'semantic-ui-react';
import { setCurrentMonitoringSetup } from 'Actions/project';
import DeviceHeaderCell from './DeviceHeaderCell';
import {
  useCurrentSetup,
  useMuteDevices,
  useSoloDevices,
  useObjects,
} from './helpers';

const DeviceHeader = ({
  projectId,
  sequenceId,
}) => {
  const currentSetup = useCurrentSetup(projectId);
  const objects = useObjects(projectId, sequenceId);
  const muteDevices = useMuteDevices();
  const soloDevices = useSoloDevices();
  const dispatch = useDispatch();

  const handleChangeSetup = (newSetup) => {
    dispatch(setCurrentMonitoringSetup(projectId, newSetup));
  };

  return (
    <Table.Row>
      <Table.HeaderCell />
      {/* Remaining header row, where a new header cell is rendered for each device */}
      {currentSetup.map(device => (
        <DeviceHeaderCell
          key={device.deviceId}
          onChangeSetup={handleChangeSetup}
          device={device}
          currentSetup={currentSetup}
          muteDevices={muteDevices}
          soloDevices={soloDevices}
          objects={objects}
        />
      ))}
    </Table.Row>
  );
};

DeviceHeader.propTypes = {
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
};

export default DeviceHeader;
