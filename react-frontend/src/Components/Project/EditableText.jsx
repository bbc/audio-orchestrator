import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Input,
} from 'semantic-ui-react';

class EditableText extends React.Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();

    this.state = {
      open: false,
    };

    this.handleClick = () => {
      this.setState({ open: true });
    };

    this.handleChange = (e) => {
      const { onChange } = this.props;
      onChange(e.target.value);
    };

    this.handleBlur = (e) => {
      this.setState({ open: false });
      this.handleChange(e);
    };

    this.handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        this.setState({ open: false });
        this.handleChange(e);
      }
    };

    this.handlePlaceholderKeyPress = (e) => {
      if (e.key === 'Enter') {
        this.handleClick();
      }
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const { open } = this.state;
    if (open && !prevState.open) {
      this.inputRef.current.select();
    }
  }

  render() {
    const { value } = this.props;
    const { open } = this.state;

    return open
      ? (
        <Input
          icon="edit"
          defaultValue={value}
          onBlur={this.handleBlur}
          onKeyPress={this.handleKeyPress}
          ref={this.inputRef}
        />
      )
      : (
        <span
          role="button"
          tabIndex="0"
          onClick={this.handleClick}
          onKeyPress={this.handlePlaceholderKeyPress}
          style={{ cursor: 'pointer' }}
        >
          {value}
          {' '}
          <Icon name="edit" />
        </span>
      );
  }
}

EditableText.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default EditableText;
