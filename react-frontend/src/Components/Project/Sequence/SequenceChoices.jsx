import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import uuidv4 from 'uuid/v4';

import {
  Container,
  Button,
  Dropdown,
  Table,
} from 'semantic-ui-react';
import ConfirmDeleteButton from '../../ConfirmDeleteButton';
import RequiredTextInput from '../../RequiredTextInput';
import { setSequenceSetting } from '../../../actions/project';

class SequenceChoices extends React.Component {
  constructor(props) {
    super(props);

    this.labelRefs = {};
    this.ensureChoiceIds();
  }

  componentDidUpdate(prevProps) {
    const { next } = this.props;
    // Check if the number of choices has just increased by one, ie. we've just added one.
    if (prevProps.next && next && next.length === prevProps.next.length + 1) {
      const lastChoiceId = next[next.length - 1].choiceId;
      if (lastChoiceId in this.labelRefs) {
        this.labelRefs[lastChoiceId].select();
      }
    }
  }

  handleChange(value) {
    const { onChange } = this.props;
    onChange(value);
  }

  handleSelectSequence(choiceId, sequenceId) {
    const { next } = this.props;

    this.handleChange(next.map((choice) => {
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
    const { next } = this.props;

    this.handleChange(next.map((choice) => {
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
    const { next } = this.props;

    this.handleChange(next.filter(choice => choice.choiceId !== choiceId));
  }

  handleAddChoice() {
    const { next } = this.props;

    this.handleChange([
      ...next,
      { choiceId: uuidv4() },
    ]);
  }

  ensureChoiceIds() {
    const { next } = this.props;

    if (next.some(({ choiceId }) => !choiceId)) {
      this.handleChange(next.map((choice) => {
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

  handleKeyPress(e, choiceId) {
    const { next } = this.props;
    const { key, target } = e;

    if (key === 'Enter') {
      target.blur();

      // Move to the next row or create a new choice.
      const nextChoice = next[next.findIndex(choice => choice.choiceId === choiceId) + 1];
      if (!nextChoice) {
        // this.handleAddChoice();
        // TODO: enable this again without disregarding the currently edited field's value.
      } else if (nextChoice.choiceId in this.labelRefs) {
        this.labelRefs[nextChoice.choiceId].select();
      }
    }
  }

  render() {
    const {
      next,
      sequencesList,
    } = this.props;

    const sequenceOptions = sequencesList.map(sequence => ({
      key: sequence.sequenceId,
      value: sequence.sequenceId,
      text: sequence.name,
    }));

    return (
      <Container>
        <Table collapsing>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell content="Choice Label" />
              <Table.HeaderCell content="Target Sequence" />
              <Table.HeaderCell content="" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { next.map(({ sequenceId, label, choiceId }) => (
              <Table.Row key={choiceId || 'initial'}>
                <Table.Cell>
                  <RequiredTextInput
                    ref={(ref) => { this.labelRefs[choiceId] = ref; }}
                    placeholder="Label"
                    error={!label}
                    defaultValue={label}
                    onKeyPress={e => this.handleKeyPress(e, choiceId)}
                    onBlur={e => this.handleChangeLabel(choiceId, e.target.value)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Dropdown
                    placeholder="Select a sequence"
                    search
                    selection
                    error={!sequenceId}
                    value={sequenceId}
                    options={sequenceOptions}
                    onChange={(e, d) => this.handleSelectSequence(choiceId, d.value)}
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
        <Button
          type="button"
          icon="plus"
          primary
          labelPosition="left"
          content="Add choice"
          onClick={() => this.handleAddChoice()}
        />
      </Container>
    );
  }
}

SequenceChoices.propTypes = {
  next: PropTypes.arrayOf(PropTypes.shape({
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

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const { sequences, sequencesList } = state.Project.projects[projectId];
  const { next } = sequences[sequenceId];

  return {
    next,
    sequencesList,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onChange: value => dispatch(setSequenceSetting(projectId, sequenceId, 'next', value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceChoices);
