import React from 'react';
import PropTypes from 'prop-types';
import ListOfEnumInput from './ListOfEnumInput.jsx';

class ListOfEnumWithAdditionInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      additions: [],
    };

    this.handleAddItem = this.handleAddItem.bind(this);
  }

  handleAddItem(e, data) {
    const { additions } = this.state;
    const { value } = data;

    if (!additions.includes(value)) {
      this.setState({
        additions: [
          ...additions,
          value,
        ],
      });
    }
  }

  render() {
    const {
      allowedValues,
      value,
      onChange,
      name,
      error,
      placeholder,
    } = this.props;

    // The list of options must be made up of:
    // - allowedValues passed in from the parent
    // - elements of the current value array that are not present in allowedValues
    // - any additions that have been added but are not (yet?) included in value

    const { additions } = this.state;

    const missingValues = value
      .filter((v) => !allowedValues.find((a) => a.value === v));

    const unselectedAdditions = additions
      .filter((a) => !value.includes(a));

    const allowedValuesWithAdditions = [
      ...allowedValues,
      ...[...missingValues, ...unselectedAdditions].map((a) => ({
        value: a,
        displayName: a,
      })),
    ];

    return (
      <ListOfEnumInput
        allowedValues={allowedValuesWithAdditions}
        value={value}
        onChange={onChange}
        name={name}
        error={error}
        placeholder={placeholder}
        allowAdditions
        onAddItem={this.handleAddItem}
      />
    );
  }
}

ListOfEnumWithAdditionInput.propTypes = {
  allowedValues: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    displayName: PropTypes.string,
  })).isRequired,
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  error: PropTypes.bool,
  placeholder: PropTypes.string,
};

ListOfEnumWithAdditionInput.defaultProps = {
  name: undefined,
  error: false,
  placeholder: undefined,
};

export default ListOfEnumWithAdditionInput;
