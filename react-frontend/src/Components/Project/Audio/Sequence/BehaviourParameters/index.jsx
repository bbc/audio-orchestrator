import React from 'react';
import PropTypes from 'prop-types';
import BehaviourParameter from './BehaviourParameter.jsx';

function BehaviourParameters({
  parameters,
  values,
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
  return (
    <>
      {parameters.map((parameter) => (
        <BehaviourParameter
          key={parameter.name}
          {...parameter}
          value={values[parameter.name]}
          onChange={(e, data) => onChange(e, {
            name: parameter.name,
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
      ))}
    </>
  );
}

BehaviourParameters.propTypes = {
  parameters: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  values: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
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

BehaviourParameters.defaultProps = {
  controlId: undefined, // only exists for control-linked behaviours
};

export default BehaviourParameters;
