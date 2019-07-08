import React from 'react';
import PropTypes from 'prop-types';
import MetadataFlag from './MetadataFlag';

const SpreadFlag = React.memo(({
  mdoSpread,
  onChangeField,
  objectNumber,
  expanded,
}) => (
  <MetadataFlag
    expanded={expanded}
    value={mdoSpread}
    name="Spread"
    description={`This object is ${!mdoSpread ? 'not ' : ''}replicated across all suitable devices.`}
    onClick={() => onChangeField(objectNumber, { mdoSpread: (mdoSpread + 1) % 2 })}
  />
));

SpreadFlag.propTypes = {
  mdoSpread: PropTypes.number.isRequired,
  onChangeField: PropTypes.func.isRequired,
  objectNumber: PropTypes.number.isRequired,
  expanded: PropTypes.bool.isRequired,
};

export default SpreadFlag;
