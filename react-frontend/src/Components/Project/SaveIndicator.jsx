import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Menu,
} from 'semantic-ui-react';

const savingStyle = {
  opacity: 0.75,
};

const savedStyle = {
  opacity: 0,
  transition: 'opacity 2s linear',
};

function SaveIndicator({
  count,
}) {
  const saved = count === 0;

  return (
    <Menu.Item
      style={count === 0 ? savedStyle : savingStyle}
    >
      <Icon name={saved ? 'check' : 'spinner'} loading={!saved} />
      {' '}
      { saved ? 'Saved' : 'Saving...' }
    </Menu.Item>
  );
}

SaveIndicator.propTypes = {
  count: PropTypes.number.isRequired,
};

export default SaveIndicator;
