import React from 'react';
import PropTypes from 'prop-types';
import MetadataFlag from './MetadataFlag';

const MdoOnlyFlag = React.memo(({
  mdoOnly,
  onChangeField,
  objectNumber,
  expanded,
}) => (
  <MetadataFlag
    expanded={expanded}
    value={mdoOnly}
    name="Auxiliary only"
    description={`This object can be in ${mdoOnly ? 'an auxiliary device only' : 'either the stereo bed or an auxiliary device'}.`}
    onClick={() => onChangeField(objectNumber, { mdoOnly: (mdoOnly + 1) % 2 })}
  />
));

MdoOnlyFlag.propTypes = {
  mdoOnly: PropTypes.number.isRequired,
  onChangeField: PropTypes.func.isRequired,
  objectNumber: PropTypes.number.isRequired,
  expanded: PropTypes.bool.isRequired,
};

export default MdoOnlyFlag;
