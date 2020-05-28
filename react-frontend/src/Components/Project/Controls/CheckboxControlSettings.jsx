import React from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4';
import {
  Card,
  Checkbox,
  Input,
  Button,
  Table,
  Header,
} from 'semantic-ui-react';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';

class CheckboxControlSettings extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleDefaultClick = this.handleDefaultClick.bind(this);
    this.handleLabelChange = this.handleLabelChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDefaultClick(e, data) {
    const {
      onChange,
      defaultValues,
      controlType,
    } = this.props;

    // The optionValue is a unique id for the option to be changed, and it is used as the name
    // field for the input components.
    // The newLabel is the new label retrieved from the current value of the text input.
    const {
      name: optionValue,
      checked,
    } = data;

    // Update the defaultValue, selecting multiple options for the 'checkbox' controlType but only
    // one for the 'radio'.
    // NOTE: The semantics of the data passed up by semantic-ui Checkbox aren't quite clear; it
    // seems that the 'checked' property is the proposed new value after the click, rather than the
    // current prop value.
    if (controlType === 'checkbox') {
      // always remove this value first to make sure no duplicates are added
      const filteredDefaultValues = defaultValues.filter(d => d !== optionValue);
      if (checked) {
        // The click would have checked it, so add it to the list
        onChange('controlDefaultValues', [...filteredDefaultValues, optionValue]);
      } else {
        // The click would have unchecked it, so don't re-add it to the list
        onChange('controlDefaultValues', filteredDefaultValues);
      }
    } else if (controlType === 'radio') {
      // The radio control can only have a single default value
      if (checked) {
        onChange('controlDefaultValues', [optionValue]);
      } else {
        onChange('controlDefaultValues', []);
      }
    }
  }

  handleLabelChange(e, data) {
    const {
      onChange,
      parameters,
    } = this.props;
    const {
      name: optionValue,
      value: newLabel,
    } = data;

    // For the label text inputs, the textual label of an option needs to be changed changed. Keep
    // all the options, but replace the label in the one that matches the input element's name.
    onChange('controlParameters', {
      ...parameters,
      options: parameters.options.map((option) => {
        if (option.value === optionValue) {
          return {
            ...option,
            label: newLabel,
          };
        }
        // if the option has a different value than the one being edited, return it unchanged.
        return option;
      }),
    });
  }

  handleAdd() {
    const {
      onChange,
      parameters,
    } = this.props;

    onChange('controlParameters', {
      ...parameters,
      options: [
        ...parameters.options,
        {
          label: '',
          value: uuidv4(),
        },
      ],
    });
  }

  handleDelete(e, data) {
    const {
      onChange,
      parameters,
      defaultValues,
    } = this.props;

    const { options } = parameters;
    const { name: optionValue } = data;

    // Update the options list, removing the option with a value matching the name
    onChange('controlParameters', {
      ...parameters,
      options: options.filter(o => o.value !== optionValue),
    });

    // Also remove the deleted option value from the defaultValue if it was included
    if (defaultValues.includes(d => d !== optionValue)) {
      onChange('controlDefaultValues', defaultValues.filter(d => d !== optionValue));
    }
  }

  render() {
    const {
      parameters,
      defaultValues,
      controlType,
    } = this.props;

    const { options } = parameters;

    return (
      <Card.Content>
        <Header content="Options" subheader="Specify the options that the listener can select." />
        {options && options.length > 0
          ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell content="Default" />
                  <Table.HeaderCell content="Label" />
                  <Table.HeaderCell content="Delete" />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {options.map(({ label, value }) => (
                  <Table.Row key={value}>
                    <Table.Cell collapsing>
                      <Checkbox
                        radio={controlType === 'radio'}
                        name={value}
                        checked={defaultValues.includes(value)}
                        onClick={this.handleDefaultClick}
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        name={value}
                        onChange={this.handleLabelChange}
                        value={label}
                        fluid
                        error={!label}
                      />
                    </Table.Cell>
                    <Table.Cell collapsing>
                      <ConfirmDeleteButton type="option" onDelete={(e) => { this.handleDelete(e, { name: value }); }} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : null }
        <Button
          type="button"
          icon="plus"
          primary
          labelPosition="left"
          content="Add option"
          size="tiny"
          onClick={this.handleAdd}
        />
      </Card.Content>
    );
  }
}

CheckboxControlSettings.propTypes = {
  parameters: PropTypes.shape({
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })),
  }).isRequired,
  defaultValues: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  controlType: PropTypes.oneOf(['radio', 'checkbox']).isRequired,
};

export default CheckboxControlSettings;
