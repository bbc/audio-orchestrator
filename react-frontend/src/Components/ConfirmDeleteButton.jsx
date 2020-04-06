import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Popup,
} from 'semantic-ui-react';

const ConfirmDeleteButton = ({
  onDelete,
  type,
  name,
  disabled,
  small,
  onOpen,
  onClose,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      onOpen();
    } else {
      onClose();
    }
  }, [open]);

  const handleOpen = () => setOpen(!disabled);

  const handleClose = () => setOpen(false);

  const handleDelete = () => {
    setOpen(false);
    onDelete();
  };

  const trigger = (
    <Button
      disabled={disabled}
      size={small ? 'tiny' : undefined}
      basic={small}
      compact={small}
      negative={!small}
      icon="trash"
    />
  );

  if (disabled) {
    return trigger;
  }

  return (
    <Popup
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      trigger={trigger}
      on="click"
      wide
    >
      <Popup.Header content={`Delete ${type}${name ? ` "${name}"` : ''}?`} />
      <Popup.Content>
        <Button.Group>
          <Button negative content="Delete" onClick={handleDelete} />
          <Button content="Keep" onClick={handleClose} />
        </Button.Group>
      </Popup.Content>
    </Popup>
  );
};

ConfirmDeleteButton.propTypes = {
  type: PropTypes.string.isRequired,
  name: PropTypes.string,
  onDelete: PropTypes.func.isRequired,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  disabled: PropTypes.bool,
  small: PropTypes.bool,
};

ConfirmDeleteButton.defaultProps = {
  name: undefined,
  disabled: false,
  small: false,
  onOpen: () => {},
  onClose: () => {},
};

export default ConfirmDeleteButton;
