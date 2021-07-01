import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Label,
} from 'semantic-ui-react';

const formatGain = (linearGain) => {
  const logGain = 20 * Math.log10(linearGain);
  return `${logGain < 0 ? '−' : '+'}${Math.abs(Math.round(logGain))} dB`;
};

const AudioObjectsCell = ({
  allocatedObjects,
}) => (
  <Table.Cell
    verticalAlign="top"
    width={1}
  >
    <Table basic="very" compact style={{ whiteSpace: 'nowrap' }}>
      <Table.Body>
        {allocatedObjects.map(({ objectId, objectGain }) => (
          <Table.Row key={objectId}>
            <Table.Cell>
              <Label basic>
                {objectId}
                {objectGain !== 1 && <Label.Detail content={formatGain(objectGain)} />}
              </Label>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  </Table.Cell>
);

AudioObjectsCell.propTypes = {
  allocatedObjects: PropTypes.arrayOf(PropTypes.shape({
    objectId: PropTypes.string,
    objectGain: PropTypes.number,
  })).isRequired,
};

export default AudioObjectsCell;
