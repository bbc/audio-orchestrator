import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  Label,
} from 'semantic-ui-react';
// import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import Behaviours from 'Lib/Behaviours';
import BehaviourParameters from './BehaviourParameters';

const BehaviourSettingsModal = ({
  contents,
  onChange,
  onClose,
  sequencesList,
  controls,
}) => {
  const {
    objectNumbers,
    edit,
    behaviourType,
    // behaviourId,
    behaviourParameters: initialBehaviourParameters,
  } = contents;

  const [behaviourParameters, setBehaviourParameters] = useState(initialBehaviourParameters);
  const replaceParameter = ({ name, value }) => {
    setBehaviourParameters({
      ...behaviourParameters,
      [name]: value,
    });
  };

  const {
    displayName,
    description,
    parameters,
    color,
  } = Behaviours.getDetails(behaviourType);

  const haveParameters = parameters && parameters.length > 0;

  const handleSave = () => {
    onChange(behaviourParameters);
  };

  return (
    <Modal open closeIcon onClose={onClose}>
      <Modal.Header>
        {`${edit ? 'Settings' : 'Initial settings'} for `}
        <Label
          content={displayName}
          size="large"
          color={color}
          style={{ display: 'inline' }}
        />
        {' behaviour'}
      </Modal.Header>

      <Modal.Content content={description} />

      { haveParameters && (
        <Modal.Content scrolling>
          <BehaviourParameters
            parameters={parameters}
            values={behaviourParameters}
            onChange={(e, data) => replaceParameter({
              name: data.name,
              value: data.value,
            })}
            sequencesList={sequencesList}
            controls={controls}
          />
        </Modal.Content>
      )}

      <Modal.Actions>
        <Button
          onClick={onClose}
          content={edit ? 'Discard changes' : 'Cancel'}
        />
        <Button
          primary
          onClick={handleSave}
          content={edit ? 'Save' : `Add to ${objectNumbers.length > 1 ? `${objectNumbers.length} objects` : 'object'}`}
        />
      </Modal.Actions>
    </Modal>
  );
};

BehaviourSettingsModal.propTypes = {
  contents: PropTypes.shape({
    objectNumbers: PropTypes.arrayOf(PropTypes.number).isRequired,
    edit: PropTypes.bool.isRequired,
    behaviourType: PropTypes.string.isRequired,
    behaviourId: PropTypes.string, // optional - not set if edit === false
    behaviourParameters: PropTypes.shape({}),
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  // onDelete: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

export default BehaviourSettingsModal;
