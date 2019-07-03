import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Header,
  Button,
} from 'semantic-ui-react';

const WarningModal = ({
  content,
  onClose,
}) => (
  <Modal
    open={!!content}
    onClose={onClose}
    closeIcon
  >
    <Header icon="exclamation" content="Warning" />
    <Modal.Content content={content} />
    <Modal.Actions>
      <Button content="close" onClick={onClose} />
    </Modal.Actions>
  </Modal>
);

WarningModal.propTypes = {
  content: PropTypes.string,
  onClose: PropTypes.func,
};

WarningModal.defaultProps = {
  content: null,
  onClose: () => {},
};

export default WarningModal;
