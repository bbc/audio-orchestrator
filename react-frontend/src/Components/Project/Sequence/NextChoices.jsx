import React from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4';

import {
  Form,
  Table,
} from 'semantic-ui-react';
import ConfirmDeleteButton from '../../ConfirmDeleteButton';

class NextChoices extends React.Component {
  constructor(props) {
    super(props);

    this.ensureChoiceIds();
  }

  fireChangeEvent(value) {
    const { onChange } = this.props;
    onChange({}, { value });
  }

  handleSelectSequence(choiceId, sequenceId) {
    const { value } = this.props;

    this.fireChangeEvent(value.map((choice) => {
      if (choice.choiceId !== choiceId) {
        return choice;
      }
      return {
        ...choice,
        sequenceId,
      };
    }));
  }

  handleChangeLabel(choiceId, label) {
    const { value } = this.props;

    this.fireChangeEvent(value.map((choice) => {
      if (choice.choiceId !== choiceId) {
        return choice;
      }
      return {
        ...choice,
        label,
      };
    }));
  }


  handleDeleteChoice(choiceId) {
    const { value } = this.props;

    this.fireChangeEvent(value.filter(choice => choice.choiceId !== choiceId));
  }

  handleAddChoice() {
    const { value } = this.props;

    this.fireChangeEvent([
      ...value,
      { choiceId: uuidv4() },
    ]);
  }

  ensureChoiceIds() {
    const { value } = this.props;

    if (value.some(({ choiceId }) => !choiceId)) {
      this.fireChangeEvent(value.map((choice) => {
        if (choice.choiceId) {
          return choice;
        }

        return {
          ...choice,
          choiceId: uuidv4(),
        };
      }));
    }
  }

  render() {
    const {
      value,
      sequencesList,
    } = this.props;

    const sequenceOptions = sequencesList.map(sequence => ({
      key: sequence.sequenceId,
      value: sequence.sequenceId,
      text: sequence.name,
    }));

    return (
      <Form>
        <Table collapsing>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell content="Target Sequence" />
              <Table.HeaderCell content="Label" />
              <Table.HeaderCell content="" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { value.map(({ sequenceId, label, choiceId }) => (
              <Table.Row key={choiceId}>
                <Table.Cell>
                  <Form.Select
                    placeholder="Target Sequence"
                    error={!sequenceId}
                    value={sequenceId}
                    options={sequenceOptions}
                    onChange={(e, d) => this.handleSelectSequence(choiceId, d.value)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Form.Input
                    placeholder="Label"
                    error={!label || label.length === 0}
                    defaultValue={label}
                    onBlur={e => this.handleChangeLabel(choiceId, e.target.value)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <ConfirmDeleteButton
                    header="Delete Choice"
                    name={label}
                    onDelete={() => this.handleDeleteChoice(choiceId)}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <Form.Button
          type="button"
          icon="plus"
          primary
          labelPosition="left"
          content="Add choice"
          onClick={() => this.handleAddChoice()}
        />
      </Form>
    );
  }
}

NextChoices.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape({
    choiceId: PropTypes.string,
    sequenceId: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default NextChoices;
