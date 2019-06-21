import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
} from 'semantic-ui-react';

class ConfirmDeleteButton extends React.Component {
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
      header,
      name,
      content,
      onDelete,
    } = this.props;

    const { open } = this.state;

    return (
      <Modal
        closeIcon
        trigger={<Button type="button" negative icon="trash" content={content} />}
        open={open}
        onOpen={() => this.handleOpen()}
        onClose={() => this.handleClose()}
      >
        <Modal.Header content={header} />
        <Modal.Content>
          {'You are about to delete '}
          <b>{name}</b>
          {'. Are you sure?'}
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
              onDelete();
              this.handleClose();
            }}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

ConfirmDeleteButton.propTypes = {
  header: PropTypes.string.isRequired,
  name: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  content: PropTypes.string,
};

ConfirmDeleteButton.defaultProps = {
  content: null,
  name: 'untitled',
};

export default ConfirmDeleteButton;
