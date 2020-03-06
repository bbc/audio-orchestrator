import React from 'react';
import PropTypes from 'prop-types';
import {
  Header,
} from 'semantic-ui-react';
import HelpModal from './HelpModal';

const PageTitleBar = ({
  title,
  shortDescription,
  helpId,
}) => (
  <Header
    size="large"
    content={(
      <span>
        {title}
        {' '}
        {helpId
          ? (
            <HelpModal helpId={helpId} />
          )
          : null}
      </span>
    )}
    subheader={shortDescription}
  />
);

PageTitleBar.propTypes = {
  title: PropTypes.string.isRequired,
  shortDescription: PropTypes.string.isRequired,
  helpId: PropTypes.string,
};

PageTitleBar.defaultProps = {
  helpId: null,
};


export default PageTitleBar;
