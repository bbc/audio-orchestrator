import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
} from 'semantic-ui-react';

class ConfirmSequenceDeleteButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  render() {
    const {
      name,
      sequenceId,
      onDelete,
    } = this.props;

    const { open } = this.state;

    return (
      <Modal
        closeIcon
        trigger={<Button negative icon="trash" />}
        open={open}
        onOpen={() => this.handleOpen()}
        onClose={() => this.handleClose()}
      >
        <Modal.Header content="Delete Sequence" />
        <Modal.Content>
          {'You are about to delete the '}
          <b>{name}</b>
          {' sequence. This action cannot be reversed.'}
        </Modal.Content>
        <Modal.Actions>
          <Button
            content="Keep it"
            onClick={() => this.handleClose()}
          />
          <Button
            negative
            content="Delete it"
            icon="trash"
            labelPosition="left"
            onClick={() => {
              onDelete(sequenceId);
              this.handleClose();
            }}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

ConfirmSequenceDeleteButton.propTypes = {
  name: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ConfirmSequenceDeleteButton;
