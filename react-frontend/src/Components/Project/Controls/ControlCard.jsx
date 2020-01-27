import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
} from 'semantic-ui-react';
import EditableText from '../EditableText';
import ControlBehavioursDevices from './ControlBehavioursDevices';
import ControlBehavioursSequences from './ControlBehavioursSequences';
import controlSettingsComponents from './controlSettingsComponents';
import controlTypes from './controlTypes';

class ControlCard extends React.PureComponent {
  render() {
    const {
      controlName,
      controlType,
      controlParameters,
      controlBehaviours,
      controlDefaultValues,
      onDelete,
      onChange,
      onMove,
      sequencesList,
    } = this.props;

    // Get display name for control type
    const {
      displayName,
    } = controlTypes.find(
      ({ name }) => name === controlType,
    );
    const controlTypeDisplayName = displayName || controlType;

    // Select the component for editing the control parameters and default values
    const ControlSettingsComponent = controlSettingsComponents[controlType] || (() => <Card.Content content="This control type is not supported for editing yet." />);

    return (
      <Card>
        <Card.Content style={{ flexGrow: 0 }}>
          <Button icon="trash" floated="right" basic size="tiny" compact onClick={onDelete} />
          <Button icon="right arrow" floated="right" basic size="tiny" compact onClick={() => onMove(1)} />
          <Button icon="left arrow" floated="right" basic size="tiny" compact onClick={() => onMove(-1)} />
          <Card.Header>
            <EditableText
              value={controlName}
              name="controlName"
              onChange={value => onChange('controlName', value)}
            />
          </Card.Header>
          {controlTypeDisplayName}
        </Card.Content>

        <ControlSettingsComponent
          controlType={controlType}
          defaultValues={controlDefaultValues}
          parameters={controlParameters}
          onChange={onChange}
        />

        <Card.Content extra>
          <ControlBehavioursDevices
            controlBehaviours={controlBehaviours}
            onChange={onChange}
          />
        </Card.Content>

        <Card.Content extra>
          <ControlBehavioursSequences
            controlBehaviours={controlBehaviours}
            sequencesList={sequencesList}
            onChange={onChange}
          />
        </Card.Content>
      </Card>
    );
  }
}

ControlCard.propTypes = {
  controlName: PropTypes.string.isRequired,
  controlType: PropTypes.string.isRequired,
  controlParameters: PropTypes.shape({}).isRequired,
  controlDefaultValues: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.arrayOf(PropTypes.number),
  ]).isRequired,
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
  onMove: PropTypes.func.isRequired,
};

export default ControlCard;
