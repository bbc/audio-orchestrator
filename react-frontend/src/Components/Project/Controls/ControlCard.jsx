import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
} from 'semantic-ui-react';
import ConfirmDeleteButton from '#Components/ConfirmDeleteButton.jsx';
import InlineHelpPopup from '#Components/InlineHelpPopup.jsx';
import EditableText from '../EditableText.jsx';
import ControlBehavioursDevices from './ControlBehavioursDevices.jsx';
import ControlBehavioursSequences from './ControlBehavioursSequences.jsx';
import controlSettingsComponents from './controlSettingsComponents.js';
import controlTypes from './controlTypes.js';

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
      onMoveUp,
      onMoveDown,
      sequencesList,
    } = this.props;

    // Get display name for control type
    const {
      displayName,
      description,
    } = controlTypes.find(
      ({ name }) => name === controlType,
    );
    const controlTypeDisplayName = displayName || controlType;

    // Select the component for editing the control parameters and default values
    const ControlSettingsComponent = controlSettingsComponents[controlType] || (() => <Card.Content content="This control type is not supported for editing yet." />);

    return (
      <Card>
        <Card.Content style={{ flexGrow: 0 }}>
          <Button.Group floated="right" basic size="tiny">
            <InlineHelpPopup
              content="Delete this control."
              className="ui buttons"
            >
              <ConfirmDeleteButton type="control" name={controlName} small notBasic onDelete={onDelete} />
            </InlineHelpPopup>

            <InlineHelpPopup
              content="Change the display order of this control."
              className="ui buttons"
            >
              <Button icon="left arrow" disabled={!onMoveUp} compact onClick={onMoveUp} />
            </InlineHelpPopup>

            <InlineHelpPopup
              content="Change the display order of this control."
              className="ui buttons"
            >
              <Button icon="right arrow" disabled={!onMoveDown} compact onClick={onMoveDown} />
            </InlineHelpPopup>
          </Button.Group>
          <Card.Header>
            <EditableText
              value={controlName}
              name="controlName"
              onChange={(value) => onChange('controlName', value)}
            />
          </Card.Header>
          {controlTypeDisplayName}
          {': '}
          {description}
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
    behaviourId: PropTypes.string,
    behaviourType: PropTypes.string,
    behaviourParameters: PropTypes.shape({}),
  })).isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};

ControlCard.defaultProps = {
  onMoveUp: undefined,
  onMoveDown: undefined,
};

export default ControlCard;
