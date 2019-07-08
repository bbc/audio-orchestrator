import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';
import MetadataFlag from './MetadataFlag';

const thresholdOptions = new Array(11).fill(undefined).map((_, i) => ({
  key: i,
  value: i,
  text: (i === 0) ? '0 (no threshold)' : `${i}+`,
}));

const ThresholdFlag = React.memo(({
  mdoThreshold,
  onChangeField,
  objectNumber,
  expanded,
}) => (
  <Dropdown
    value={mdoThreshold}
    options={thresholdOptions}
    onChange={(e, { value }) => onChangeField(objectNumber, { mdoThreshold: value })}
    scrolling
    icon={null}
    trigger={(
      <MetadataFlag
        expanded={expanded}
        value={mdoThreshold}
        name="Threshold"
        description={`This object is inactive until at least ${mdoThreshold} auxiliary ${mdoThreshold === 1 ? 'device is' : 'devices are'} connected.`}
      />
    )}
  />
));

ThresholdFlag.propTypes = {
  mdoThreshold: PropTypes.number.isRequired,
  onChangeField: PropTypes.func.isRequired,
  objectNumber: PropTypes.number.isRequired,
  expanded: PropTypes.bool.isRequired,
};

export default ThresholdFlag;
