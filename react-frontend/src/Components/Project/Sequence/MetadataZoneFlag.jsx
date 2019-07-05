import React from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
  Icon,
  Button,
} from 'semantic-ui-react';

const levels = {
  1: {
    description: 'The object is not allowed in a device with this tag.',
    icon: 'square outline',
    color: 'red',
    name: 'never',
  },
  2: {
    description: 'The object is allowed in a device with this tag.',
    icon: 'minus square',
    color: 'yellow',
    name: 'allowed',
  },
  3: {
    description: 'The object\'s target device is one with this tag.',
    icon: 'plus square',
    color: 'green',
    name: 'target',
  },
};

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

const levelName = (level) => {
  if (level in levels) {
    return levels[level].name;
  }
  return '???';
};

const MetadataZoneFlag = ({
  value,
  name,
  expanded,
  onClick,
}) => (
  <Popup
    header={name}
    content={description(value)}
    horizontalOffset={expanded ? 3 : 12}
    trigger={expanded ? (
      <Button
        size="mini"
        content={levelName(value)}
        compact
        basic
        color={color(value)}
        icon={icon(value)}
        onClick={onClick}
      />
    ) : (
      <Icon
        link
        color={color(value)}
        name={icon(value)}
        onClick={onClick}
      />
    )}
  />
);

MetadataZoneFlag.propTypes = ({
  value: PropTypes.number,
  name: PropTypes.string.isRequired,
  expanded: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
});

MetadataZoneFlag.defaultProps = ({
  value: null,
  onClick: () => {},
});

export default MetadataZoneFlag;
