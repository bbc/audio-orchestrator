import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
} from 'semantic-ui-react';
import InlineHelpPopup from 'Components/InlineHelpPopup';
import {
  useCurrentSetup, useControls, useControlsList, useSequencesList,
} from './helpers';
import ControlsCell from './ControlsCell';

const findConditionPropertyValues = (control, property) => {
  const { controlBehaviours = [] } = control;
  const behaviour = controlBehaviours.find(({ behaviourType }) => behaviourType === 'allowedIf') || {};
  const { behaviourParameters = {} } = behaviour;
  const { conditions = [] } = behaviourParameters;
  const { value = [] } = conditions.find(condition => condition.property === property) || {};

  return value;
};

const ControlsSection = ({
  projectId,
  sequenceId,
}) => {
  const currentSetup = useCurrentSetup(projectId);
  const controls = useControls(projectId);
  const controlsList = useControlsList(projectId);
  const sequencesList = useSequencesList(projectId);

  // Controls are shown within their table row, in a cell for each device, as:
  // - fully interactive, if they are allowed for the device role (aux or main) and sequence;
  // - disabled, if they are not allowed in the current sequence; or
  // - hidden, if they are not allowed on the device role (aux or main).

  // Generate a nested list of controls and devices for rendering
  const statusPerControlAndDevice = [];
  controlsList.forEach((control) => {
    const { controlId } = control;
    const statusPerDevice = [];

    // The control behaviours use an inverted allowedIf condition, so we are interested in any
    // sequence that isn't listed in the control behaviour value.
    const prohibitedSequenceIds = findConditionPropertyValues(controls[controlId], 'session.currentContentId');
    const availableInSequence = !prohibitedSequenceIds.includes(sequenceId);
    const allowedSequenceNames = sequencesList
      .filter(sequence => !prohibitedSequenceIds.includes(sequence.sequenceId))
      .map(sequence => sequence.name);

    currentSetup.forEach((device) => {
      const deviceIsMain = device.joiningNumber === 1;
      const availableOnDevice = findConditionPropertyValues(controls[controlId], 'device.deviceIsMain')
        .includes(deviceIsMain);

      // Set popup content to a falsy value to not show any popup.
      let popupContent = null;
      if (!availableInSequence) {
        if (allowedSequenceNames.length > 0) {
          popupContent = `This control can only be changed in some sequences (${allowedSequenceNames.join(', ')}).`;
        } else {
          popupContent = 'This control cannot be changed in any sequence; check the Controls page to choose where it can appear.';
        }
      }

      statusPerDevice.push({
        device,
        hidden: availableOnDevice,
        disabled: !availableInSequence,
        popupContent,
      });
    });

    statusPerControlAndDevice.push({
      control,
      statusPerDevice,
    });
  });

  return (
    <>
      {statusPerControlAndDevice.map(({ control, statusPerDevice }) => (
        <Table.Row
          key={control.controlId}
        >
          <Table.Cell active width={1} content={control.controlName} />

          {statusPerDevice.map(({
            device, disabled, popupContent, hidden,
          }) => (
            <Table.Cell width={1} key={device.deviceId}>
              { !hidden && (
                <InlineHelpPopup content={popupContent}>
                  <ControlsCell
                    control={control}
                    device={device}
                    controls={controls}
                    disabled={disabled}
                    projectId={projectId}
                    currentSetup={currentSetup}
                  />
                </InlineHelpPopup>
              )}
            </Table.Cell>
          ))}
        </Table.Row>
      ))
      }
    </>
  );
};

ControlsSection.propTypes = {
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
};

export default ControlsSection;
