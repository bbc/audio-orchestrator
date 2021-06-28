import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  Table,
} from 'semantic-ui-react';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import { setSavedMonitoringSetups } from 'Actions/project';
import { useSavedSetups, deleteSavedSetup } from './helpers';
import { presetMonitoringSetups } from './presetDeviceSetups';

const ManageSetupsModal = ({
  onClose,
  projectId,
}) => {
  const savedSetups = useSavedSetups(projectId);
  const dispatch = useDispatch();

  return (
    <Modal
      open
      closeIcon
      onClose={onClose}
    >
      <Modal.Header content="Manage device setups" />
      <Modal.Content>
        <Table basic="very">
          <Table.Body>
            {savedSetups.length > 0 && (
              <Table.Row>
                <Table.HeaderCell content="Custom setups" />
                <Table.Cell collapsing>
                  <ConfirmDeleteButton
                    type="all device setups"
                    onDelete={() => dispatch(setSavedMonitoringSetups(projectId, []))}
                    small
                    color="red"
                  />
                </Table.Cell>
              </Table.Row>
            )}
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
            <Table.Row key="presets">
              <Table.HeaderCell colSpan="2" content="Preset setups" />
            </Table.Row>
            {presetMonitoringSetups.map(setup => (
              <Table.Row key={setup.id}>
                <Table.Cell content={setup.name} />
                <Table.Cell collapsing />
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Modal.Content>
      <Modal.Actions>
        <Button
          content="Close"
          onClick={onClose}
        />
      </Modal.Actions>
    </Modal>
  );
};

ManageSetupsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.string.isRequired,
};

export default ManageSetupsModal;
