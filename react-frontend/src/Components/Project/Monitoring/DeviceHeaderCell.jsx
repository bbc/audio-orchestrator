import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Table, Dropdown, Header, Icon, Button,
} from 'semantic-ui-react';
import {
  muteSoloDevice,
} from 'Actions/monitoring';
import { deviceTypes } from 'Lib/behaviourTypes';
import InlineHelpPopup from 'Components/InlineHelpPopup';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import {
  getDeviceCurrentNumber,
  deleteOneDevice,
  changeDeviceType,
  toggleDeviceOnOff,
  resetControls,
  useConnectedToDAW,
} from './helpers';

const DeviceHeaderCell = ({
  device,
  muteDevices,
  soloDevices,
  objects,
  currentSetup,
  onChangeSetup,
}) => {
  const dispatch = useDispatch();
  const connectedToDAW = useConnectedToDAW();
  const {
    deviceId,
    deviceType,
    switchedOn,
    joiningNumber,
  } = device;

  const muteAndSoloDisabled = !connectedToDAW || !switchedOn;
  const isMuted = muteDevices.includes(deviceId);
  const isSoloed = soloDevices.includes(deviceId);

  const { icon: deviceTypeIcon } = deviceTypes.find(({ value }) => value === deviceType) || {};

  // Only needed so that the OSC msgs can be formed and sent when mute or solo is clicked
  // Allows the OSC helper functions to find the audio objects to mute
  return (
    <Table.HeaderCell
      key={deviceId}
      id={deviceId}
    >
      <Dropdown
        inline // Makes the caret slightly closer to the header
        trigger={(
          <Header as="h3" floated="left">
            <Icon name={deviceTypeIcon} size="small" />
            <Header.Content>
              <InlineHelpPopup
                content="The joining number of this device."
              >
                {joiningNumber}
              </InlineHelpPopup>
              {// Current number is only displayed if the device is switched on
                switchedOn
                  ? (
                    <InlineHelpPopup
                      content="The current number of this device."
                    >

                      <span style={{ fontWeight: 'normal', fontSize: '10pt' }}>
                        {' | '}
                        {
                          getDeviceCurrentNumber(device, currentSetup)
                        }
                      </span>
                    </InlineHelpPopup>
                  )
                  : <> </>
              }
              <Header.Subheader>
                {joiningNumber === 1
                  ? '  Main'
                  : '  Aux'
                }
              </Header.Subheader>
            </Header.Content>
          </Header>
        )}
        options={deviceTypes.map(option => ({
          key: option.value,
          icon: option.icon,
          content: option.displayName,
          onClick: () => onChangeSetup(changeDeviceType(option, device, currentSetup)),
        }))}
      />
      <br />
      <Button.Group basic size="mini" compact>
        <InlineHelpPopup
          content="Switch this device on or off."
          className="ui buttons"
        >
          <Button
            disabled={joiningNumber === 1}
            toggle
            onClick={() => onChangeSetup(toggleDeviceOnOff(switchedOn, device, currentSetup))}
            icon="power"
            compact
            active={switchedOn}
          />
        </InlineHelpPopup>
        <InlineHelpPopup
          content="Delete this device."
          className="ui buttons"
        >
          <ConfirmDeleteButton
            type="this device"
            onDelete={() => onChangeSetup(deleteOneDevice(deviceId, currentSetup))}
            small
            disabled={joiningNumber === 1}
          />
        </InlineHelpPopup>
        <InlineHelpPopup
          content="Reset controls to their default values on this device."
          className="ui buttons"
        >
          <Button
            icon="undo"
            compact
            onClick={() => onChangeSetup(resetControls(device, currentSetup))}
          />
        </InlineHelpPopup>
        <InlineHelpPopup
          content="Mute this device in DAW audio playback."
          className="ui buttons"
        >
          <Button
            content="M"
            icon
            compact
            toggle
            active={isMuted}
            disabled={muteAndSoloDisabled}
            onClick={() => {
              dispatch(muteSoloDevice(
                deviceId,
                isMuted ? muteDevices.filter(id => id !== deviceId) : [...muteDevices, deviceId],
                soloDevices,
                objects,
                currentSetup,
              ));
            }}
          />
        </InlineHelpPopup>
        <InlineHelpPopup
          content="Solo this device in DAW audio playback."
          className="ui buttons"
        >
          <Button
            content="S"
            icon
            compact
            toggle
            active={isSoloed}
            disabled={muteAndSoloDisabled}
            onClick={() => {
              dispatch(muteSoloDevice(
                deviceId,
                muteDevices,
                isSoloed ? soloDevices.filter(id => id !== deviceId) : [...soloDevices, deviceId],
                objects,
                currentSetup,
              ));
            }}
          />
        </InlineHelpPopup>
      </Button.Group>
    </Table.HeaderCell>
  );
};

DeviceHeaderCell.propTypes = {
  device: PropTypes.shape({
    deviceId: PropTypes.string,
    deviceType: PropTypes.string,
    switchedOn: PropTypes.bool,
    joiningNumber: PropTypes.number,
  }).isRequired,
  muteDevices: PropTypes.arrayOf(PropTypes.string).isRequired,
  soloDevices: PropTypes.arrayOf(PropTypes.string).isRequired,
  objects: PropTypes.shape({}).isRequired, // TODO remove this somehow
  currentSetup: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChangeSetup: PropTypes.func.isRequired,
};

export default DeviceHeaderCell;
