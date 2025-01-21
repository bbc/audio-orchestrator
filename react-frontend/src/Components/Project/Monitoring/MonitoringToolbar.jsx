import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Button, Menu, Dropdown, Icon,
} from 'semantic-ui-react';
import {
  setCurrentMonitoringSetup,
} from '#Actions/project.js';
import { deviceTypes } from '#Lib/behaviourTypes.js';
import InlineHelpPopup from '#Components/InlineHelpPopup.jsx';
import ConfirmDeleteButton from '#Components/ConfirmDeleteButton.jsx';
import RunAlgorithmButton from './RunAlgorithmButton.jsx';
import PlayPauseButtons from './PlayPauseButtons.jsx';
import {
  useCurrentSetup,
  useSavedSetups,
  useObjects,
  addDeviceToMonitoringSetup,
  deleteAllDevices,
} from './helpers.js';
import ConnectToDAWButton from './ConnectToDAWButton.jsx';
import SaveSetupModal from './SaveSetupModal.jsx';
import ManageSetupsModal from './ManageSetupsModal.jsx';
import { presetMonitoringSetups } from './presetDeviceSetups.js';

function MonitoringToolbar({
  projectId,
  currentSequenceId,
}) {
  // Set constants for required properties in state
  const currentSetup = useCurrentSetup(projectId);
  const objects = useObjects(projectId, currentSequenceId);

  // Set a savedSetups constant to be the list of savedSetups in redux state
  // concatenated with the presets
  const savedSetups = useSavedSetups(projectId).concat(presetMonitoringSetups);

  // Create a shorthand for useDispatch
  const dispatch = useDispatch();

  // Modals for managing and saving the device setups
  const [manageSetupsOpen, setManageSetupsOpen] = useState(false);
  const [saveSetupOpen, setSaveSetupOpen] = useState(false);

  const savedSetupOptions = savedSetups.map((savedSetup) => ({
    key: savedSetup.id,
    text: savedSetup.name,
    onClick: () => { dispatch(setCurrentMonitoringSetup(projectId, savedSetup)); },
  }));
  const addDeviceOptions = deviceTypes.map((option) => ({
    key: option.value,
    text: option.displayName,
    onClick: () => {
      dispatch(setCurrentMonitoringSetup(
        projectId,
        addDeviceToMonitoringSetup(
          option,
          currentSetup.length > 0 ? currentSetup[currentSetup.length - 1].joiningNumber : 0,
          currentSetup,
        ),
      ));
    },
  }));

  return (
    <>
      { saveSetupOpen && (
        <SaveSetupModal
          onClose={(() => { setSaveSetupOpen(false); })}
          setup={currentSetup}
          projectId={projectId}
        />
      )}
      { manageSetupsOpen && (
        <ManageSetupsModal
          onClose={(() => { setManageSetupsOpen(false); })}
          projectId={projectId}
        />
      )}
      <Menu secondary>
        <Menu.Menu position="right">
          <Menu.Item>
            <Button.Group size="small">
              <ConnectToDAWButton
                objects={objects}
                projectId={projectId}
              />
            </Button.Group>
          </Menu.Item>
          <Menu.Item>
            <Button.Group basic size="small">
              <PlayPauseButtons />
              <RunAlgorithmButton projectId={projectId} currentSequenceId={currentSequenceId} />
            </Button.Group>
          </Menu.Item>
          <Menu.Item>
            <Button.Group basic size="small">
              <InlineHelpPopup
                content="Load device setup."
                className="ui buttons"
              >
                <Dropdown
                  compact
                  className="button icon"
                  icon={null}
                  button
                  item
                  direction="left"
                  options={savedSetupOptions}
                  trigger={(
                    <Icon
                      name="folder open"
                      fitted
                    />
                  )}
                />
              </InlineHelpPopup>
              <InlineHelpPopup
                content="Save this device setup."
                className="ui buttons"
              >
                <Button
                  icon="save"
                  className="icon"
                  onClick={() => setSaveSetupOpen(true)}
                />
              </InlineHelpPopup>
              <InlineHelpPopup
                content="View or delete saved device setups."
                className="ui buttons"
              >
                <Button
                  icon="bars"
                  className="icon"
                  onClick={() => setManageSetupsOpen(true)}
                />
              </InlineHelpPopup>
            </Button.Group>
          </Menu.Item>
          <Menu.Item>
            <Button.Group basic size="small">
              <InlineHelpPopup
                content="Delete all devices."
                className="ui buttons"
              >
                <ConfirmDeleteButton
                  onDelete={() => dispatch(setCurrentMonitoringSetup(
                    projectId,
                    deleteAllDevices(currentSetup[0]),
                  ))}
                  type="all devices"
                  notBasic
                  small
                />
              </InlineHelpPopup>
              <InlineHelpPopup
                content="Add device."
                className="ui buttons"
              >
                <Dropdown
                  compact
                  icon={null}
                  className="button icon"
                  button
                  item
                  options={addDeviceOptions}
                  trigger={(
                    <Icon
                      name="plus"
                      fitted
                    />
                  )}
                />
              </InlineHelpPopup>
            </Button.Group>
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    </>
  );
}

MonitoringToolbar.propTypes = {
  projectId: PropTypes.string.isRequired,
  currentSequenceId: PropTypes.string.isRequired,
};

export default MonitoringToolbar;
