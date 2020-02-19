import React from 'react';
import PropTypes from 'prop-types';
import {
  Icon,
  Message,
} from 'semantic-ui-react';
import HelpModal from './HelpModal';

const PageTitleBar = ({
  title,
  shortDescription,
  helpId,
}) => (
  <Message icon>
    <Icon name="lightbulb outline" />
    <Message.Content>
      <Message.Header>
        {title}
        {helpId ? ' ' : null}
        {helpId
          ? (
            <HelpModal helpId={helpId} />
          )
          : null}
      </Message.Header>
      {shortDescription}
    </Message.Content>
  </Message>
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
