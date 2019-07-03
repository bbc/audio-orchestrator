import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Header,
} from 'semantic-ui-react';

const ErrorModal = ({
  content,
}) => (
  <Modal
    open={!!content}
    closeOnEscape={false}
    closeOnDimmerClick={false}
  >
    <Header icon="close" content="Error" />
    <Modal.Content>
      <p>{content}</p>
      <p>Please try again after restarting the application or contact the authors for support.</p>
    </Modal.Content>
  </Modal>

);

ErrorModal.propTypes = {
  content: PropTypes.string,
};

ErrorModal.defaultProps = {
  content: null,
};

export default ErrorModal;
