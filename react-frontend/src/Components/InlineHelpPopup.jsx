import React from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
} from 'semantic-ui-react';

// Wrapping contents in a <span class="ui buttons"> to enable mouse events for the popup even when
// the button is disabled, .
const InlineHelpPopup = ({
  content,
  children,
  className,
}) => (
  <Popup
    inverted
    basic
    position="top center"
    content={content}
    trigger={(
      <span className={className}>
        {children}
      </span>
    )}
  />
);

InlineHelpPopup.propTypes = {
  content: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

InlineHelpPopup.defaultProps = {
  className: undefined,
};

export default InlineHelpPopup;
