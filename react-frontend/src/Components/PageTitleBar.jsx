import React from 'react';
import PropTypes from 'prop-types';
import {
  Header,
} from 'semantic-ui-react';
import HelpLinkIcon from './HelpLinkIcon.jsx';

function PageTitleBar({
  title,
  shortDescription,
  helpId,
}) {
  return (
    <Header
      size="large"
      content={(
        <span>
          {title}
          {' '}
          {helpId
            ? (
              <HelpLinkIcon helpId={helpId} />
            )
            : null}
        </span>
    )}
      subheader={shortDescription}
    />
  );
}

PageTitleBar.propTypes = {
  title: PropTypes.string.isRequired,
  shortDescription: PropTypes.string.isRequired,
  helpId: PropTypes.string,
};

PageTitleBar.defaultProps = {
  helpId: null,
};

export default PageTitleBar;
