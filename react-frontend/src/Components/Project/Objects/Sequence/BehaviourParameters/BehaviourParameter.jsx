import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Table,
  Divider,
} from 'semantic-ui-react';
import GainInput from './GainInput';
import ConditionsListInput from './ConditionsListInput';
import EnumInput from './EnumInput';
import ListOfEnumInput from './ListOfEnumInput';

const inputComponents = {
  gain: GainInput,
  conditionsList: ConditionsListInput,
  enum: EnumInput,
  listOfEnum: ListOfEnumInput,
};

const BehaviourParameter = React.memo(({
  name,
  description,
  type,
  allowedValues,
  value,
  onChange,
  sequencesList,
}) => {
  // If the type is not registered, use a standard text input
  const InputComponent = inputComponents[type] || Input;

  return (
    <Table.Row verticalAlign="top">
      <Table.Cell content={name} />
      <Table.Cell>
        <InputComponent
          allowedValues={allowedValues}
          value={value}
          onChange={onChange}
          sequencesList={sequencesList}
        />
        <Divider hidden />
        {description}
      </Table.Cell>
    </Table.Row>
  );
});

BehaviourParameter.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  allowedValues: PropTypes.arrayOf(PropTypes.shape({})),
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({})),
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
};

BehaviourParameter.defaultProps = {
  allowedValues: [],
};

export default BehaviourParameter;
