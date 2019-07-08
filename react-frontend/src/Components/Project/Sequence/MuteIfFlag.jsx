import React from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
} from 'semantic-ui-react';
import MetadataFlag from './MetadataFlag';

const MuteIfFlag = React.memo(({
  muteIfObject,
  objectsList,
  onChangeField,
  objectNumber,
  expanded,
}) => {
  const objectOptions = [
    {
      key: 0,
      value: 0,
      text: '0: none',
    },
    ...objectsList.map(o => ({
      key: o.objectNumber,
      value: o.objectNumber,
      text: `${o.objectNumber}: ${o.label}`,
    })),
  ];

  return (
    <Dropdown
      value={muteIfObject}
      options={objectOptions}
      onChange={(e, { value }) => onChangeField(objectNumber, { muteIfObject: value })}
      scrolling
      icon={null}
      trigger={(
        <MetadataFlag
          expanded={expanded}
          value={muteIfObject}
          name="Mute if"
          description={`This object is ${!muteIfObject ? 'not ' : ''}disabled if ${muteIfObject ? `the object with number ${muteIfObject}` : 'a specified object'} is active.`}
        />
      )}
    />
  );
});

MuteIfFlag.propTypes = {
  muteIfObject: PropTypes.number.isRequired,
  onChangeField: PropTypes.func.isRequired,
  objectNumber: PropTypes.number.isRequired,
  expanded: PropTypes.bool.isRequired,
  objectsList: PropTypes.arrayOf(PropTypes.shape({
    objectNumber: PropTypes.number,
    label: PropTypes.string,
  })).isRequired,
};

export default MuteIfFlag;
