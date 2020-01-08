import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Table,
  Divider,
} from 'semantic-ui-react';
import GainInput from './GainInput';
import ConditionsListInput from './ConditionsListInput';
import OnChangeStartInput from './OnChangeStartInput';
import OnChangeAllocateInput from './OnChangeAllocateInput';

const inputComponents = {
  gain: GainInput,
  conditionsList: ConditionsListInput,
  onChangeStart: OnChangeStartInput,
  onChangeAllocate: OnChangeAllocateInput,
};

const BehaviourParameter = React.memo(({
  name,
  description,
  type,
  value,
  onChange,
}) => {
  // If the type is not registered, use a standard text input
  const InputComponent = inputComponents[type] || Input;

  return (
    <Table.Row verticalAlign="top">
      <Table.Cell content={name} />
      <Table.Cell>
        <InputComponent
          value={value}
          onChange={onChange}
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
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({})),
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
};

export default BehaviourParameter;
