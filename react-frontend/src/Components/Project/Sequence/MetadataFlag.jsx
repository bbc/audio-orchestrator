import React from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
  Icon,
} from 'semantic-ui-react';

const MetadataFlag = ({
  value,
  name,
  description,
}) => (
  <Popup
    header={name}
    content={description}
    horizontalOffset={12}
    trigger={(
      <Icon
        color={value ? 'green' : 'red'}
        name={value ? 'check circle' : 'circle outline'}
      />
    )}
  />
);

MetadataFlag.propTypes = ({
  value: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
});

export default MetadataFlag;
