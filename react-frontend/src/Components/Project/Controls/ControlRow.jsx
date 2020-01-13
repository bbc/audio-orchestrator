import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
} from 'semantic-ui-react';
import EditableText from '../EditableText';
import ConfirmDeleteButton from '../../ConfirmDeleteButton';
import controlTypes from './controlTypes';

import EnumInput from '../Objects/Sequence/BehaviourParameters/EnumInput';
import ListOfEnumInput from '../Objects/Sequence/BehaviourParameters/ListOfEnumInput';

const DEVICE_PROPERTY = 'device.deviceIsMain';
const CONTENT_ID_PROPERTY = 'session.currentContentId';

const MAIN_DEVICE_ONLY = 'main';
const OTHER_DEVICES_ONLY = 'other';
const ALL_DEVICES = 'all';

// helpers to get condition and condition value by property name
const conditionByProperty = (behaviour = {}, p) => {
  const { behaviourParameters = {} } = behaviour;
  const { conditions = [] } = behaviourParameters;
  return conditions.find(({ property }) => property === p);
};

const conditionValueByProperty = (behaviour = {}, property) => (
  (conditionByProperty(behaviour, property) || {}).value
);

// Helper to create a behaviour based on given behaviour and devicesAllowed flag
const makeBehaviourWithAllowedDevices = (behaviour, devicesAllowed) => {
  const { behaviourId } = behaviour;
  const contentIdCondition = conditionByProperty(behaviour, CONTENT_ID_PROPERTY);
  const deviceCondition = conditionByProperty(behaviour, DEVICE_PROPERTY);

  let value;
  switch (devicesAllowed) {
    case MAIN_DEVICE_ONLY:
      value = [true];
      break;
    case OTHER_DEVICES_ONLY:
      value = [false];
      break;
    default:
      value = [true, false];
  }

  return {
    behaviourId,
    behaviourType: 'allowedIf',
    behaviourParameters: {
      conditions: [
        contentIdCondition,
        {
          conditionId: deviceCondition.conditionId,
          property: DEVICE_PROPERTY,
          operator: 'anyOf',
          value,
          invertCondition: false,
        },
      ],
    },
  };
};

// helper to create a new behaviour based on given behaviour and disallowed sequenceIds
const makeBehaviourWithDisallowedSequenceIds = (behaviour, disallowedSequenceIds) => {
  const { behaviourId } = behaviour;
  const deviceCondition = conditionByProperty(behaviour, DEVICE_PROPERTY);
  const contentIdCondition = conditionByProperty(behaviour, CONTENT_ID_PROPERTY);

  return {
    behaviourId,
    behaviourType: 'allowedIf',
    behaviourParameters: {
      conditions: [
        deviceCondition,
        {
          conditionId: contentIdCondition.conditionId,
          property: CONTENT_ID_PROPERTY,
          operator: 'anyOf',
          value: disallowedSequenceIds,
          invertCondition: true,
        },
      ],
    },
  };
};

class ControlRow extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, data) {
    const { name, value } = data;
    const { sequencesList, controlBehaviours, onChange } = this.props;

    const behaviour = controlBehaviours[0] || {};

    switch (name) {
      case 'allowedSequenceIds':
        onChange('controlBehaviours', [
          makeBehaviourWithDisallowedSequenceIds(behaviour, sequencesList
            .filter(({ sequenceId }) => !value.includes(sequenceId))
            .map(({ sequenceId }) => sequenceId)),
        ]);
        break;
      case 'devicesAllowed':
        onChange('controlBehaviours', [
          makeBehaviourWithAllowedDevices(behaviour, value),
        ]);
        break;
      default:
        break;
    }
  }

  render() {
    const {
      controlName,
      controlType,
      controlBehaviours,
      onDelete,
      onChange,
      sequencesList,
    } = this.props;

    // Get display name for control type
    const controlTypeDisplayName = (controlTypes.find(
      ({ name }) => name === controlType,
    ) || {}).displayName || controlType;

    // prepare options for the sequence enum
    const sequenceOptions = sequencesList.map(({ sequenceId, name }) => ({
      value: sequenceId,
      displayName: name,
    }));

    const devicesOptions = [
      {
        value: ALL_DEVICES,
        displayName: 'All devices',
      },
      {
        value: MAIN_DEVICE_ONLY,
        displayName: 'Main device only',
      },
      {
        value: OTHER_DEVICES_ONLY,
        displayName: 'Other devices only',
      },
    ];

    // Get a list of sequenceIds that are disallowed, and then create the opposite of it
    const behaviour = controlBehaviours[0];
    const disallowedSequenceIds = conditionValueByProperty(behaviour, CONTENT_ID_PROPERTY) || [];
    const allowedSequenceIds = sequencesList
      .filter(({ sequenceId }) => !disallowedSequenceIds.includes(sequenceId))
      .map(({ sequenceId }) => sequenceId);

    // Determine whether all, the main device only, or other devices only are allowed
    const mainDeviceAllowedList = conditionValueByProperty(behaviour, DEVICE_PROPERTY) || [];
    const mainDeviceAllowed = mainDeviceAllowedList.includes(true);
    const otherDevicesAllowed = mainDeviceAllowedList.includes(false);

    let devicesAllowed = ALL_DEVICES;
    if (!mainDeviceAllowed) {
      devicesAllowed = OTHER_DEVICES_ONLY;
    } else if (!otherDevicesAllowed) {
      devicesAllowed = MAIN_DEVICE_ONLY;
    }

    return (
      <Table.Row>
        <Table.Cell>
          <EditableText
            value={controlName}
            name="controlName"
            onChange={value => onChange('controlName', value)}
          />
          <br />
          {controlTypeDisplayName}
        </Table.Cell>
        <Table.Cell>todo controlParameters...</Table.Cell>
        <Table.Cell>
          <EnumInput
            name="devicesAllowed"
            value={devicesAllowed}
            allowedValues={devicesOptions}
            onChange={this.handleChange}
          />
        </Table.Cell>
        <Table.Cell>
          <ListOfEnumInput
            name="allowedSequenceIds"
            value={allowedSequenceIds}
            allowedValues={sequenceOptions}
            onChange={this.handleChange}
          />
        </Table.Cell>
        <Table.Cell>
          <ConfirmDeleteButton
            header={`Delete ${controlTypeDisplayName} control`}
            name={controlName}
            onDelete={onDelete}
          />
        </Table.Cell>
      </Table.Row>
    );
  }
}

ControlRow.propTypes = {
  controlName: PropTypes.string.isRequired,
  controlType: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  controlBehaviours: PropTypes.arrayOf(PropTypes.shape({
    behaviourId: PropTypes.behaviourId,
    behaviourType: PropTypes.string,
    behaviourParameters: PropTypes.shape({}),
  })).isRequired,
};

export default ControlRow;
