import React from 'react';
import PropTypes from 'prop-types';
import BehaviourParameter from './BehaviourParameter';

const BehaviourParameters = React.memo(({
  parameters,
  values,
  onChange,
  sequencesList,
  controls,
  controlId,
}) => (
  <>
    {parameters.map(parameter => (
      <BehaviourParameter
        key={parameter.name}
        {...parameter}
        value={values[parameter.name]}
        onChange={(e, data) => onChange(e, {
          name: parameter.name,
          value: data.value,
        })}
        sequencesList={sequencesList}
        controls={controls}
        controlId={controlId}
      />
    ))}
  </>
));

BehaviourParameters.propTypes = {
  parameters: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  values: PropTypes.shape({}).isRequired,
  onChange: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  controlId: PropTypes.string,
};

BehaviourParameters.defaultProps = {
  controlId: undefined, // only exists for control-linked behaviours
};

export default BehaviourParameters;
