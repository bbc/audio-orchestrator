import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Header,
  Button,
} from 'semantic-ui-react';

const ErrorModal = ({
  content,
  link,
}) => (
  <Modal
    open={!!content}
    closeOnEscape={false}
    closeOnDimmerClick={false}
  >
    <Header icon="close" content="Error" />
    <Modal.Content>
      <p>{content}</p>
      { link && (
        <p>
          <Button
            primary
            icon="question circle outline"
            labelPosition="left"
            content="More information"
            onClick={() => { window.miscFunctions.openUrl(link); }}
          />
        </p>
      )}
      <p>Please try again after restarting the application or contact the authors for support.</p>
    </Modal.Content>
  </Modal>

);

ErrorModal.propTypes = {
  content: PropTypes.string,
  link: PropTypes.string,
};

ErrorModal.defaultProps = {
  content: null,
  link: null,
};

export default ErrorModal;
