import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';

const channelMappingOptions = [
  {
    key: 'left',
    value: 'left',
    text: 'left',
  },
  {
    key: 'mono',
    value: 'mono',
    text: 'centre',
  },
  {
    key: 'right',
    value: 'right',
    text: 'right',
  },
];

const PanningFlag = React.memo(({
  channelMapping,
  onChange,
  objectNumber,
}) => (
  <Dropdown
    value={channelMapping}
    options={channelMappingOptions}
    onChange={(e, { value }) => onChange(objectNumber, value)}
  />
));

PanningFlag.propTypes = {
  channelMapping: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  objectNumber: PropTypes.number.isRequired,
};

export default PanningFlag;
