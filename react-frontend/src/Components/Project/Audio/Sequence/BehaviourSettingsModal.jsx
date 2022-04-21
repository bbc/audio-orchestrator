import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  Label,
  Header,
} from 'semantic-ui-react';
import Behaviours from 'Lib/Behaviours';
import BehaviourParameters from './BehaviourParameters';

const validateBehaviourParameters = (
  parameterDefinitions, parameterValues,
) => parameterDefinitions.every(({ name, type, defaultValue }) => {
  const value = parameterValues[name];
  switch (type) {
    case 'number':
      return value !== undefined && !Number.isNaN(value);
    case 'object':
      return value !== defaultValue;
    case 'conditionsList':
      return value.every(condition => !!condition.property
        && condition.operator !== undefined
        && condition.value !== undefined);
    case 'imageItems':
      return value.every(item => item.start !== undefined && !Number.isNaN(item.start)
        && item.duration !== undefined && !Number.isNaN(item.duration));
    default:
      // assume parameters of unknown type are always valid
      return true;
  }
});

const BehaviourSettingsModal = ({
  contents,
  onChange,
  onClose,
  sequencesList,
  objectsList,
  controls,
  sequenceDuration,
  images,
  imagesLoading,
  onAddImages,
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
  } = Behaviours.getDetails(behaviourType, controls);

  const haveParameters = parameters && parameters.length > 0;

  const parametersValid = validateBehaviourParameters(parameters, behaviourParameters);

  const handleSave = () => {
    onChange(behaviourParameters);
  };

  // if it's a control behaviour, determine the controlId from the second half of the behaviourType
  let controlId;
  if (behaviourType.startsWith('control:')) {
    [, controlId] = behaviourType.split(':');
  }

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
        <Header style={{ marginTop: '8px' }} subheader={description} />
      </Modal.Header>

      <Modal.Content>
        { haveParameters && (
          <BehaviourParameters
            parameters={parameters}
            values={behaviourParameters}
            onChange={(e, data) => replaceParameter({
              name: data.name,
              value: data.value,
            })}
            sequencesList={sequencesList}
            objectsList={objectsList}
            controls={controls}
            controlId={controlId}
            sequenceDuration={sequenceDuration}
            images={images}
            imagesLoading={imagesLoading}
            onAddImages={onAddImages}
          />
        )}
      </Modal.Content>

      <Modal.Actions>
        { !parametersValid && (
          <Label
            basic
            color="red"
            icon="exclamation"
            content="Not all settings are complete."
          />
        )}
        <Button
          onClick={onClose}
          content={edit ? 'Discard changes' : 'Cancel'}
        />
        <Button
          primary
          onClick={handleSave}
          content={edit ? 'Save' : `Add to ${objectNumbers.length > 1 ? `${objectNumbers.length} objects` : 'object'}`}
          disabled={!parametersValid}
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
    sequenceId: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  objectsList: PropTypes.arrayOf(PropTypes.shape({
    objectNumber: PropTypes.number,
    label: PropTypes.string,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  sequenceDuration: PropTypes.number.isRequired,
  images: PropTypes.shape({}).isRequired,
  imagesLoading: PropTypes.bool.isRequired,
  onAddImages: PropTypes.func.isRequired,
};

export default BehaviourSettingsModal;
