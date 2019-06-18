import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Input,
  Menu,
} from 'semantic-ui-react';

class EditableMenuHeader extends React.Component {
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

    return (
      <Menu.Item header onClick={this.handleClick}>
        { open
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
            <span>
              <Icon name="edit" />
              {' '}
              {value}
            </span>
          )
        }
      </Menu.Item>
    );
  }
}

EditableMenuHeader.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default EditableMenuHeader;
