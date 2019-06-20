import React from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
  Icon,
} from 'semantic-ui-react';

const levels = [
  null,
  { color: 'red', description: 'can not be', icon: 'square outline' },
  { color: 'yellow', description: 'is allowed', icon: 'minus square' },
  { color: 'green', description: 'should be', icon: 'plus square' },
];

const color = (level) => {
  if (level in levels) {
    return levels[level].color;
  }
  return null;
};

const description = (level) => {
  if (level in levels) {
    return levels[level].description;
  }
  return 'has an invalid value set for this tag; it may still be';
};

const icon = (level) => {
  if (level in levels) {
    return levels[level].icon;
  }
  return 'exclamation';
};

const MetadataZoneFlag = ({
  value,
  name,
}) => (
  <Popup
    header={name}
    content={`The object ${description(value)} in a device with this tag.`}
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
  value: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
});

export default MetadataZoneFlag;
