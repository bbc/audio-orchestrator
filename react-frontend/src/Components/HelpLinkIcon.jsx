import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Popup,
  Icon,
  Button,
} from 'semantic-ui-react';
import helpLinks from './helpLinks';
import { requestOpenUrl } from '../actions/export';

const HelpLinkIcon = ({
  helpId,
  onOpenUrl,
}) => {
  const [open, setOpen] = useState(false);

  // If there's no entry for helpId in helpText.js, don't render
  if (!(helpId in helpLinks)) {
    return null;
  }

  // Get the values from the JSON file
  const {
    link = null,
  } = helpLinks[helpId];

  if (link) {
    return (
      <Popup
        basic
        on="click"
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        wide
        trigger={
          <Icon link name="question circle outline" />
        }
      >
        <Popup.Header content="Documentation" />
        <Popup.Content>
          <Button
            content="Open in browser"
            onClick={() => {
              onOpenUrl(link);
              setOpen(false);
            }}
          />
        </Popup.Content>
      </Popup>
    );
  }

  return null;
};

HelpLinkIcon.propTypes = {
  helpId: PropTypes.string.isRequired,
  onOpenUrl: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onOpenUrl: url => dispatch(requestOpenUrl(url)),
});

export default connect(null, mapDispatchToProps)(HelpLinkIcon);
