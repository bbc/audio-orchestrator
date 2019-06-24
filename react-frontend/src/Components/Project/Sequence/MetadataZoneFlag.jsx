import React from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
  Icon,
} from 'semantic-ui-react';

const levels = [
  null,
  {
    description: 'The object is not allowed in a device with this tag.',
    icon: 'square outline',
    color: 'red',
  },
  {
    description: 'The object is allowed in a device with this tag.',
    icon: 'minus square',
    color: 'yellow',
  },
  {
    description: 'The object\'s target device is one with this tag.',
    icon: 'plus square',
    color: 'green',
  },
];

const color = (level) => {
  if (level in levels) {
    return levels[level].color;
  }
  return 'red';
};

const description = (level) => {
  if (level in levels) {
    return levels[level].description;
  }
  return 'This object has no value set for this tag!';
};

const icon = (level) => {
  if (level in levels) {
    return levels[level].icon;
  }
  return 'question circle';
};

const MetadataZoneFlag = ({
  value,
  name,
}) => (
  <Popup
    header={name}
    content={description(value)}
    horizontalOffset={12}
    trigger={(
      <Icon
        color={color(value)}
        name={icon(value)}
      />
    )}
  />
);

MetadataZoneFlag.propTypes = ({
  value: PropTypes.number,
  name: PropTypes.string.isRequired,
});

MetadataZoneFlag.defaultProps = ({
  value: null,
});

export default MetadataZoneFlag;
