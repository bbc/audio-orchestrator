import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Header,
  Table,
} from 'semantic-ui-react';
import { setSavedMonitoringSetups } from 'Actions/project';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import { useSavedSetups, deleteSavedSetup } from './helpers';
import { presetMonitoringSetups } from './presetDeviceSetups';

const DeleteDeviceSetupModalSection = ({ projectId }) => {
  const savedSetups = useSavedSetups(projectId);
  const dispatch = useDispatch();
  return (
    <Table basic="very">
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Header
              content="Delete device setups"
              subheader="Delete device setups you have saved in this project."
            />
          </Table.Cell>
          <Table.Cell collapsing>
            <ConfirmDeleteButton
              type="all device setups"
              onDelete={() => dispatch(setSavedMonitoringSetups(projectId, []))}
              small
              color="red"
            />
          </Table.Cell>
        </Table.Row>
        {savedSetups.map(setup => (
          <Table.Row key={setup.id}>
            <Table.Cell content={setup.name} />
            <Table.Cell collapsing>
              <ConfirmDeleteButton
                type="this device setup"
                onDelete={() => dispatch(setSavedMonitoringSetups(
                  projectId,
                  deleteSavedSetup(setup.id, savedSetups),
                ))}
                small
              />
            </Table.Cell>
          </Table.Row>
        ))}
        {presetMonitoringSetups.map(setup => (
          <Table.Row key={setup.id}>
            <Table.Cell content={setup.name} />
            <Table.Cell collapsing />
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

DeleteDeviceSetupModalSection.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default DeleteDeviceSetupModalSection;
