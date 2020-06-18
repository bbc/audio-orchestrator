import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Header,
  Button,
} from 'semantic-ui-react';

const WarningModal = ({
  content,
  link,
  onClose,
}) => (
  <Modal
    open={!!content}
    onClose={onClose}
    closeIcon
  >
    <Header icon="delete" content="Error" />
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
    </Modal.Content>

    <Modal.Actions>
      <Button content="Close" onClick={onClose} />
    </Modal.Actions>
  </Modal>
);

WarningModal.propTypes = {
  content: PropTypes.string,
  link: PropTypes.string,
  onClose: PropTypes.func,
};

WarningModal.defaultProps = {
  content: null,
  link: null,
  onClose: () => {},
};

export default WarningModal;
