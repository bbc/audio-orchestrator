import React from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
  Icon,
  Button,
} from 'semantic-ui-react';

const MetadataFlag = React.memo(({
  value,
  name,
  description,
  // expanded,
  onClick,
}) => (
  <Popup
    header={name}
    content={description}
    horizontalOffset={12}
    trigger={(
      <Icon
        link
        color={value ? 'green' : 'red'}
        name={value ? 'check circle' : 'circle outline'}
        onClick={onClick}
      />
    )}
  />
));

MetadataFlag.propTypes = ({
  value: PropTypes.number,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  // expanded: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
});

MetadataFlag.defaultProps = ({
  value: null,
  onClick: () => {},
});

export default MetadataFlag;
