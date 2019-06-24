import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Popup,
} from 'semantic-ui-react';
import MetadataFlag from './MetadataFlag';
import MetadataZoneFlag from './MetadataZoneFlag';

const ObjectRow = ({
  objectNumber,
  channelMapping,
  label,
  file,
  orchestration,
  zones,
}) => {
  const {
    exclusivity,
    mdoOnly,
    mdoSpread,
    mdoThreshold,
    muteIfObject,
    // onDropin,
    // onDropout,
    image,
  } = orchestration;

  return (
    <Table.Row negative={!file || !!file.error}>
      <Table.Cell>{objectNumber}</Table.Cell>
      <Table.Cell>{label}</Table.Cell>

      { file
        ? (
          <Table.Cell>
            { !file.error
              ? <span>{file.name}</span>
              : (
                <Popup
                  trigger={(
                    <span>
                      <Icon name="exclamation" />
                      {file.name}
                    </span>
                  )}
                  content={file.error}
                />
              )
            }
          </Table.Cell>
        )
        : (
          <Table.Cell>
            <Icon name="exclamation" />
            No audio file matches the object number.
          </Table.Cell>
        )
      }

      <Table.Cell>{channelMapping === 'mono' ? 'centre' : channelMapping}</Table.Cell>

      <Table.Cell>
        <MetadataFlag
          value={exclusivity}
          name="Exclusive"
          description={`${exclusivity ? 'No other' : 'Other'} objects can share the auxiliary device this object is assigned to.`}
        />
        <MetadataFlag
          value={mdoOnly}
          name="Auxiliary only"
          description={`This object can be in ${mdoOnly ? 'an auxiliary device only' : 'either the stereo bed or an auxiliary device'}.`}
        />
        <MetadataFlag
          value={mdoSpread}
          name="Spread"
          description={`This object is ${!mdoSpread ? 'not ' : ''}replicated across all suitable devices.`}
        />
        <MetadataFlag
          value={mdoThreshold}
          name="Threshold"
          description={`This object is inactive until at least ${mdoThreshold} auxiliary ${mdoThreshold === 1 ? 'device is' : 'devices are'} connected.`}
        />
        <MetadataFlag
          value={muteIfObject}
          name="Mute if"
          description={`This object is ${!muteIfObject ? 'not ' : ''}disabled if ${muteIfObject ? `the object with number ${muteIfObject}` : 'a specified object'} is active.`}
        />
      </Table.Cell>

      { (zones && zones.length > 0)
        ? (
          <Table.Cell>
            { zones.map(zone => (
              <MetadataZoneFlag
                value={orchestration[zone.name]}
                name={zone.name}
                key={zone.zoneId}
              />
            ))}
          </Table.Cell>
        )
        : (
          <Table.Cell>
            <Icon name="exclamation" />
            Project has no tags.
          </Table.Cell>
        )
      }

      <Table.Cell content={image} />
    </Table.Row>
  );
};


ObjectRow.propTypes = {
  objectNumber: PropTypes.number.isRequired,
  channelMapping: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string,
  }),
  orchestration: PropTypes.shape({
    exclusivity: PropTypes.number,
    mdoOnly: PropTypes.number,
    mdoSpread: PropTypes.number,
    mdoThreshold: PropTypes.number,
    muteIfObject: PropTypes.number,
    // onDropin: PropTypes.number,
    // onDropout: PropTypes.number,
    image: PropTypes.string,
  }).isRequired,
  zones: PropTypes.arrayOf(PropTypes.shape({
    zoneId: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
  })),
};

ObjectRow.defaultProps = {
  file: null,
  zones: [],
  orchestration: {}
};

export default ObjectRow;
