import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Table,
} from 'semantic-ui-react';

// TODO list valid options in behaviourTypes?
const allStartOptions = [
  'canAlwaysStart',
  'canNeverRestart',
  'canOnlyStartOnFirstRun',
];

const allAllocateOptions = [
  'moveToPreferred',
  'stayInPrevious',
  'moveToAllowedNotPrevious',
  'moveToAllowed',
];

class BehaviourParameter extends React.PureComponent {
  constructor(props) {
    super(props);

    const { value } = props;

    this.state = {
      error: !this.validate(JSON.stringify(value) || ''),
    };

    this.handleChange = this.handleChange.bind(this);
  }

  validate(value) {
    const {
      type,
      required,
    } = this.props;

    // An empty value is fine if the parameter is not required.
    if (value.length === 0) {
      return !required;
    }

    // Try to parse the input as a JSON string and check its type
    try {
      const parsedValue = JSON.parse(value);

      switch (type) {
        case 'number':
          return typeof parsedValue === 'number';
        case 'string':
          return typeof parsedValue === 'string';
        case 'conditionsList':
          // TODO: Test array elements, too
          return Array.isArray(parsedValue);
        case 'onChangeStart':
          return allStartOptions.includes(parsedValue);
        case 'onChangeAllocate':
          return Array.isArray(parsedValue)
            && parsedValue.every(v => allAllocateOptions.includes(v));
        default:
          return true;
      }
    } catch (e) {
      // if the JSON parsing throws an error, the input value was invalid.
      return false;
    }
  }

  handleChange(e, { value }) {
    const { onChange } = this.props;

    const error = !this.validate(value);
    this.setState({ error });

    if (!error) {
      let parsedValue;
      if (value.length > 0) {
        parsedValue = JSON.parse(value);
      }
      onChange(e, { value: parsedValue });
    }
  }

  render() {
    const {
      name,
      description,
      value,
      type,
    } = this.props;

    const { error } = this.state;

    return (
      <Table.Row verticalAlign="top">
        <Table.Cell content={name} />
        <Table.Cell>
          <Input
            size="small"
            error={error}
            defaultValue={JSON.stringify(value) || ''}
            onChange={this.handleChange}
            placeholder={type}
          />
        </Table.Cell>
        <Table.Cell content={description} />
      </Table.Row>
    );
  }
}

BehaviourParameter.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  required: PropTypes.bool,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({})),
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

BehaviourParameter.defaultProps = {
  required: false,
  value: undefined,
};

export default BehaviourParameter;
