import React from 'react';
import PropTypes from 'prop-types';

import {
  Input,
} from 'semantic-ui-react';

class RequiredTextInput extends React.Component {
  constructor(props) {
    super(props);

    const { defaultValue } = props;
    this.state = { valid: !!defaultValue };
    this.inputRef = null;

    this.validate = this.validate.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  validate() {
    if (this.inputRef) {
      // TODO: hack, accessing undocumented properties of <Input /> to get at the value
      try {
        const { value } = this.inputRef.inputRef.current;
        this.setState({ valid: !!value });
      } catch (e) {
        console.error('could not validate, could not access current value of Input component.');
      }
    }
  }

  focus() {
    if (this.inputRef) this.inputRef.focus();
  }

  select() {
    if (this.inputRef) this.inputRef.select();
  }

  handleKeyUp(e) {
    const { onKeyUp } = this.props;
    this.validate();

    if (onKeyUp) onKeyUp(e, e);
  }

  render() {
    const { valid } = this.state;

    return (
      <Input
        {...{
          ...this.props,
          ref: (ref) => { this.inputRef = ref; },
          onKeyUp: this.handleKeyUp,
          error: !valid,
        }}
      />
    );
  }
}

RequiredTextInput.propTypes = {
  defaultValue: PropTypes.string,
  onKeyUp: PropTypes.func,
};

RequiredTextInput.defaultProps = {
  defaultValue: null,
  onKeyUp: null,
};

export default RequiredTextInput;
