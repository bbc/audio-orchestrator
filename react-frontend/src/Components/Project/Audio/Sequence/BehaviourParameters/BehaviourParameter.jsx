import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Header,
  Segment,
} from 'semantic-ui-react';
import GainInput from './GainInput';
import ConditionsListInput from './ConditionsListInput';
import EnumInput from './EnumInput';
import ListOfEnumInput from './ListOfEnumInput';
import ControlValuesInput from './ControlValuesInput';

const inputComponents = {
  gain: GainInput,
  conditionsList: ConditionsListInput,
  enum: EnumInput,
  listOfEnum: ListOfEnumInput,
  controlValues: ControlValuesInput,
};

const BehaviourParameter = React.memo(({
  name,
  displayName,
  description,
  type,
  allowedValues,
  value,
  onChange,
  sequencesList,
  controls,
  controlId,
}) => {
  // If the type is not registered, use a standard text input
  const InputComponent = inputComponents[type] || Input;

  return (
    <Segment vertical>
      <Header content={displayName || name} subheader={description} />
      <InputComponent
        allowedValues={allowedValues}
        value={value}
        onChange={onChange}
        sequencesList={sequencesList}
        controls={controls}
        controlId={controlId}
      />
    </Segment>
  );
});

BehaviourParameter.propTypes = {
  onChange: PropTypes.func.isRequired,
  displayName: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  allowedValues: PropTypes.arrayOf(PropTypes.shape({})),
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.any),
  ]).isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  controlId: PropTypes.string,
};

BehaviourParameter.defaultProps = {
  allowedValues: [],
  displayName: undefined,
  controlId: undefined,
};

export default BehaviourParameter;
