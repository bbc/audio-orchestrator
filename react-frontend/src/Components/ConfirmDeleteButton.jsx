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
  notBasic, // fix for use within a Button.Group, where basic must be set on the container instead
  onOpen,
  onClose,
  icon,
  color,
  onBlur,
  onClick,
  onFocus,
  onMouseLeave,
  onMouseEnter,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      onOpen();
    } else {
      onClose();
    }
  }, [open]);

  const handleOpen = () => {
    setOpen(!disabled);
    if (onClick) onClick();
  };

  const handleClose = () => setOpen(false);

  const handleDelete = () => {
    setOpen(false);
    onDelete();
  };

  const trigger = (
    <Button
      disabled={disabled}
      size={small ? 'tiny' : undefined}
      basic={small && !notBasic}
      compact={small}
      negative={!small}
      icon={icon}
      color={color}
      onClick={handleOpen}
      onBlur={onBlur}
      onFocus={onFocus}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    />
  );

  if (disabled || !open) {
    return trigger;
  }

  return (
    <Popup
      basic
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
  icon: PropTypes.string,
  color: PropTypes.string,
  onBlur: PropTypes.func,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseEnter: PropTypes.func,
  notBasic: PropTypes.bool,
};

ConfirmDeleteButton.defaultProps = {
  name: undefined,
  disabled: false,
  small: false,
  onOpen: () => {},
  onClose: () => {},
  icon: 'trash',
  color: undefined,
  onBlur: undefined,
  onClick: undefined,
  onFocus: undefined,
  onMouseLeave: undefined,
  onMouseEnter: undefined,
  notBasic: false,
};

export default ConfirmDeleteButton;
