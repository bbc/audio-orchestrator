import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';

// TODO define valid options in behaviourTypes; perhaps refactor this into a StringArrayInput?
const options = [
  'moveToPreferred',
  'stayInPrevious',
  'moveToAllowedNotPrevious',
  'moveToAllowed',
].map(v => ({
  key: v,
  text: v, // TODO define display names for options
  value: v,
}));

const OnChangeAllocateInput = React.memo(({
  value,
  onChange,
}) => (
  <Dropdown
    multiple
    selection
    value={value}
    onChange={onChange}
    options={options}
  />
));

OnChangeAllocateInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default OnChangeAllocateInput;
