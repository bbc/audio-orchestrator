import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';

const options = [
  'canAlwaysStart',
  'canNeverRestart',
  'canOnlyStartOnFirstRun',
].map(v => ({
  key: v,
  text: v,
  value: v,
}));

const OnChangeStartInput = React.memo(({
  value,
  onChange,
}) => (
  <Dropdown
    selection
    value={value}
    onChange={onChange}
    options={options}
  />
));

OnChangeStartInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default OnChangeStartInput;
