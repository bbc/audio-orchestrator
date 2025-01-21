import React from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
} from 'semantic-ui-react';

// Wrapping contents in a <span class="ui buttons"> to enable mouse events for the popup even when
// the button is disabled, .
function InlineHelpPopup({
  content,
  children,
  className,
}) {
  if (!content) {
    return children;
  }

  return (
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
}

InlineHelpPopup.propTypes = {
  content: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

InlineHelpPopup.defaultProps = {
  content: null,
  className: undefined,
};

export default InlineHelpPopup;
