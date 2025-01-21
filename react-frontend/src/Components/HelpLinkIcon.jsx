import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Popup,
  Icon,
  Button,
} from 'semantic-ui-react';
import helpLinks from './helpLinks.js';

function HelpLinkIcon({
  helpId,
}) {
  const [open, setOpen] = useState(false);

  // If there's no entry for helpId in helpText.js, don't render
  if (!(helpId in helpLinks)) {
    return null;
  }

  // Get the values from the JSON file
  const {
    links = null,
  } = helpLinks[helpId];

  if (links) {
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
          {links.map((item) => {
            const {
              link,
              description,
            } = item;

            return (
              <p key={link}>
                <Button
                  type="button"
                  icon="question circle outline"
                  primary
                  labelPosition="left"
                  size="tiny"
                  content={description}
                  onClick={() => {
                    window.miscFunctions.openUrl(link);
                    setOpen(false);
                  }}
                />
              </p>
            );
          })}
        </Popup.Content>
      </Popup>
    );
  }

  return null;
}

HelpLinkIcon.propTypes = {
  helpId: PropTypes.string.isRequired,
};

export default HelpLinkIcon;
