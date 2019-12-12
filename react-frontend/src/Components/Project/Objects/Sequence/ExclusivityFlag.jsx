import React from 'react';
import PropTypes from 'prop-types';
import MetadataFlag from './MetadataFlag';

const ExclusivityFlag = React.memo(({
  exclusivity,
  onChangeField,
  objectNumber,
  expanded,
}) => (
  <MetadataFlag
    expanded={expanded}
    value={exclusivity}
    name="Exclusive"
    description={`${exclusivity ? 'No other' : 'Other'} objects can share the auxiliary device this object is assigned to.`}
    onClick={() => onChangeField(objectNumber, { exclusivity: (exclusivity + 1) % 2 })}
  />
));

ExclusivityFlag.propTypes = {
  exclusivity: PropTypes.number.isRequired,
  onChangeField: PropTypes.func.isRequired,
  objectNumber: PropTypes.number.isRequired,
  expanded: PropTypes.bool.isRequired,
};

export default ExclusivityFlag;
