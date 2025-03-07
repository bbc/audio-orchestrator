import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
} from 'semantic-ui-react';
import ListOfEnumInput from '../Audio/Sequence/BehaviourParameters/ListOfEnumInput.jsx';
import {
  getSequenceIdsAllowed,
  makeBehavioursWithDisallowedSequenceIds,
} from './controlBehaviourHelpers.js';

class ControlBehavioursSequences extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e, data) {
    const { value } = data;
    const {
      sequencesList,
      controlBehaviours,
      onChange,
    } = this.props;

    onChange(
      'controlBehaviours',
      makeBehavioursWithDisallowedSequenceIds(controlBehaviours, sequencesList
        .filter(({ sequenceId }) => !value.includes(sequenceId))
        .map(({ sequenceId }) => sequenceId)),
    );
  }

  render() {
    const {
      controlBehaviours,
      sequencesList,
    } = this.props;

    // prepare options for the sequence enum
    const sequenceOptions = sequencesList.map(({ sequenceId, name }) => ({
      value: sequenceId,
      displayName: name,
    }));

    const value = getSequenceIdsAllowed(controlBehaviours, sequencesList);

    return (
      <Card.Content extra>
        <ListOfEnumInput
          name="allowedSequenceIds"
          value={value}
          allowedValues={sequenceOptions}
          onChange={this.handleChange}
          error={value.length === 0}
          placeholder="Click to add sequences..."
        />
        Select the sequences during which the control should be visible.
      </Card.Content>
    );
  }
}

ControlBehavioursSequences.propTypes = {
  controlBehaviours: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChange: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ControlBehavioursSequences;
