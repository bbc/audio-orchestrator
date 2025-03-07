import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Header,
  Segment,
} from 'semantic-ui-react';
import GainInput from './GainInput.jsx';
import ConditionsListInput from './ConditionsListInput/index.jsx';
import EnumInput from './EnumInput.jsx';
import ListOfEnumInput from './ListOfEnumInput.jsx';
import ControlValuesInput from './ControlValuesInput.jsx';
import ObjectInput from './ObjectInput.jsx';
import ImageItemsInput from './ImageItemsInput.jsx';

const inputComponents = {
  gain: GainInput,
  conditionsList: ConditionsListInput,
  enum: EnumInput,
  listOfEnum: ListOfEnumInput,
  controlValues: ControlValuesInput,
  object: ObjectInput,
  imageItems: ImageItemsInput,
};

function BehaviourParameter({
  name,
  displayName,
  description,
  type,
  allowedValues,
  value,
  onChange,
  sequencesList,
  objectsList,
  controls,
  controlId,
  sequenceDuration,
  images,
  imagesLoading,
  onAddImages,
}) {
  // If the type is not registered, use a standard text input
  const InputComponent = inputComponents[type] || Input;

  return (
    <Segment vertical>
      <Header content={displayName || name} subheader={description} />
      <InputComponent
        allowedValues={allowedValues}
        value={value}
        onChange={onChange}
        sequencesList={sequencesList}
        objectsList={objectsList}
        controls={controls}
        controlId={controlId}
        sequenceDuration={sequenceDuration}
        images={images}
        imagesLoading={imagesLoading}
        onAddImages={onAddImages}
      />
    </Segment>
  );
}

BehaviourParameter.propTypes = {
  onChange: PropTypes.func.isRequired,
  displayName: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  allowedValues: PropTypes.arrayOf(PropTypes.shape({})),
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.any),
  ]).isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  objectsList: PropTypes.arrayOf(PropTypes.shape({
    objectNumber: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    label: PropTypes.string,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  controlId: PropTypes.string,
  sequenceDuration: PropTypes.number.isRequired,
  images: PropTypes.shape({}).isRequired,
  imagesLoading: PropTypes.bool.isRequired,
  onAddImages: PropTypes.func.isRequired,
};

BehaviourParameter.defaultProps = {
  allowedValues: [],
  displayName: undefined,
  controlId: undefined,
};

export default BehaviourParameter;
