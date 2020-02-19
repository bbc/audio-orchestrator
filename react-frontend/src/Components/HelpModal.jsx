import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Icon,
  Header,
} from 'semantic-ui-react';
import helpText from './helpText';

const HelpModal = ({ helpId }) => {
  // If there's no entry for helpId in helpText.js, don't render
  if (!(helpId in helpText)) {
    return null;
  }

  // Get the values from the JSON file
  const {
    title,
    description,
    link = null,
  } = helpText[helpId];

  return (
    <Modal
      trigger={
        <Icon name="question circle outline" />
      }
      closeOnEscape
      closeOnDimmerClick={false}
      closeIcon
    >
      <Header icon="question circle outline" content={title} />
      <Modal.Content>

        <p>{description}</p>
        {link
          ? (
            <p>
              <b>Find out more: </b>
              <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
            </p>
          )
          : '' }
      </Modal.Content>
    </Modal>
  );
};

HelpModal.propTypes = {
  helpId: PropTypes.string.isRequired,
};

export default HelpModal;
