import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Popup,
} from 'semantic-ui-react';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import Behaviours from 'Lib/Behaviours';

const Behaviour = ({
  behaviourType,
  controls,
  onEdit,
  onDelete,
}) => {
  const {
    displayName,
    description,
    parameters,
    color,
  } = Behaviours.getDetails(behaviourType, controls);

  const haveParameters = parameters && parameters.length > 0;

  return (
    <Button.Group
      style={{ marginRight: '3px', marginBottom: '3px' }}
      size="tiny"
    >
      <Popup
        inverted
        basic
        content={description}
        trigger={(
          <Button
            onClick={haveParameters ? onEdit : undefined}
            content={displayName}
            compact
            color={color}
          />
        )}
      />
      { haveParameters && (
        <Button
          basic
          onClick={onEdit}
          icon="edit"
          compact
          color={color}
        />
      )}
      <ConfirmDeleteButton
        small
        color={color}
        icon="delete"
        type="behaviour"
        name={displayName}
        onDelete={onDelete}
      />
    </Button.Group>
  );
};

Behaviour.propTypes = {
  behaviourType: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
};

Behaviour.defaultProps = {
  controls: [],
};

export default Behaviour;
