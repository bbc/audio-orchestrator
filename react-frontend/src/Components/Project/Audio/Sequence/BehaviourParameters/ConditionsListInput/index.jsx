import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
  Button,
} from 'semantic-ui-react';
import ConditionInput from './ConditionInput.jsx';

class ConditionsListInput extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleConditionChange = this.handleConditionChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  // TODO: consider moving condition updates into reducer to avoid potential race conditions
  handleConditionChange(e, data) {
    const { value: conditionValue, conditionId } = data;

    const { value, onChange } = this.props;

    onChange(e, {
      value: value.map((v) => {
        if (v.conditionId === conditionId) {
          return {
            conditionId: v.conditionId,
            ...conditionValue,
          };
        }
        return v;
      }),
    });
  }

  handleAdd(e) {
    const { value, onChange } = this.props;

    onChange(e, {
      value: [
        ...value,
        {
          conditionId: uuidv4(),
          property: '',
          operator: '',
          value: '',
          invertCondition: false,
        },
      ],
    });
  }

  handleDelete(e, conditionId) {
    const { value, onChange } = this.props;

    onChange(e, {
      value: value.filter((v) => v.conditionId !== conditionId),
    });
  }

  render() {
    const {
      value,
      sequencesList,
      objectsList,
      controls,
    } = this.props;

    return (
      <div>
        { value.map(({
          conditionId,
          property,
          operator,
          value: conditionValue,
          invertCondition,
        }) => (
          <ConditionInput
            key={conditionId}
            value={{
              property,
              operator,
              value: conditionValue,
              invertCondition,
            }}
            onDelete={(e) => this.handleDelete(e, conditionId)}
            onChange={(e, data) => this.handleConditionChange(e, { ...data, conditionId })}
            sequencesList={sequencesList}
            objectsList={objectsList}
            controls={controls}
          />
        ))}
        <Button size="small" icon="plus" content="Add condition" primary onClick={this.handleAdd} />
      </div>
    );
  }
}

ConditionsListInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onChange: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  objectsList: PropTypes.arrayOf(PropTypes.shape({
    objectNumber: PropTypes.number,
    label: PropTypes.string,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default ConditionsListInput;
