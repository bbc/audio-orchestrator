import React from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
  Icon,
  Button,
} from 'semantic-ui-react';

const MetadataFlag = ({
  value,
  name,
  description,
  expanded,
  onClick,
}) => (
  <Popup
    header={name}
    content={description}
    horizontalOffset={expanded ? 3 : 12}
    trigger={expanded ? (
      <Button
        size="mini"
        content={value}
        compact
        circular
        basic
        color={value ? 'green' : 'red'}
        icon={value ? 'check circle' : 'circle outline'}
        onClick={onClick}
      />
    ) : (
      <Icon
        link
        color={value ? 'green' : 'red'}
        name={value ? 'check circle' : 'circle outline'}
        onClick={onClick}
      />
    )}
  />
);

MetadataFlag.propTypes = ({
  value: PropTypes.number,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
});

MetadataFlag.defaultProps = ({
  value: null,
  onClick: () => {},
});

export default MetadataFlag;
