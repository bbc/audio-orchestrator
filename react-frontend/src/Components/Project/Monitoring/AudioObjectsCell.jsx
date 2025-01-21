import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  List,
  Label,
} from 'semantic-ui-react';

const formatGain = (linearGain) => {
  const logGain = 20 * Math.log10(linearGain);

  if (logGain === -Infinity) {
    return '−Inf dB';
  }

  return `${logGain < 0 ? '−' : '+'}${Math.abs(Math.round(logGain))} dB`;
};

function AudioObjectsCell({
  allocatedObjects,
}) {
  return (
    <Table.Cell
      verticalAlign="top"
      width={1}
    >
      <List>
        {allocatedObjects.map(({ objectId, objectGain }) => (
          <List.Item key={objectId}>
            <List.Content>
              <Label basic>
                {objectId}
                {objectGain !== 1 && <Label.Detail className="labelDetailRed" content={formatGain(objectGain)} />}
              </Label>
            </List.Content>
          </List.Item>
        ))}
      </List>
    </Table.Cell>
  );
}

AudioObjectsCell.propTypes = {
  allocatedObjects: PropTypes.arrayOf(PropTypes.shape({
    objectId: PropTypes.string,
    objectGain: PropTypes.number,
  })).isRequired,
};

export default AudioObjectsCell;
