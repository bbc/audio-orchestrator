import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Popup,
  Dropdown,
} from 'semantic-ui-react';
import MetadataFlag from './MetadataFlag';
import MetadataZoneFlag from './MetadataZoneFlag';

const thresholdOptions = new Array(11).fill(undefined).map((_, i) => ({
  key: i,
  value: i,
  text: (i === 0) ? '0 (no threshold)' : `${i}+`,
}));

class ObjectRow extends React.PureComponent {
  render() {
    const {
      objectNumber,
      channelMapping,
      // label,
      file,
      orchestration,
      zones,
      expanded,
      onChangeField,
      objectsList,
    } = this.props;

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

    const metadataFlags = [
      <MetadataFlag
        expanded={expanded}
        key="exclusivity"
        value={exclusivity}
        name="Exclusive"
        description={`${exclusivity ? 'No other' : 'Other'} objects can share the auxiliary device this object is assigned to.`}
        onClick={() => onChangeField(objectNumber, { exclusivity: (exclusivity + 1) % 2 })}
      />,
      <MetadataFlag
        expanded={expanded}
        key="mdoOnly"
        value={mdoOnly}
        name="Auxiliary only"
        description={`This object can be in ${mdoOnly ? 'an auxiliary device only' : 'either the stereo bed or an auxiliary device'}.`}
        onClick={() => onChangeField(objectNumber, { mdoOnly: (mdoOnly + 1) % 2 })}
      />,
      <MetadataFlag
        expanded={expanded}
        key="mdoSpread"
        value={mdoSpread}
        name="Spread"
        description={`This object is ${!mdoSpread ? 'not ' : ''}replicated across all suitable devices.`}
        onClick={() => onChangeField(objectNumber, { mdoSpread: (mdoSpread + 1) % 2 })}
      />,
      <Dropdown
        value={mdoThreshold}
        key="mdoThreshold"
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
      />,
      <Dropdown
        value={muteIfObject}
        key="muteIfObject"
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
      />,
    ];

    const zoneFlags = (zones && zones.length > 0) ? zones.map(zone => (
      <MetadataZoneFlag
        expanded={expanded}
        value={orchestration[zone.name]}
        name={zone.name}
        key={zone.zoneId}
        onClick={() => onChangeField(
          objectNumber,
          {
            [zone.name]: (orchestration[zone.name] - 1) || 3,
          },
        )}
      />
    )) : [(
      <span key="no-tags">
        <Icon name="exclamation" />
        Project has no tags.
      </span>
    )];

    return (
      <Table.Row negative={!file || !!file.error}>
        <Table.Cell>{objectNumber}</Table.Cell>

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

        { expanded
          ? (
            metadataFlags.map(f => (
              <Table.Cell key={f.key} content={f} />
            ))
          )
          : (
            <Table.Cell content={metadataFlags} />
          )
        }

        { expanded
          ? zoneFlags.map(f => (
            <Table.Cell key={f.key} content={f} />
          ))
          : (
            <Table.Cell content={zoneFlags} />
          )
        }

        <Table.Cell content={image} />
      </Table.Row>
    );
  }
}

ObjectRow.propTypes = {
  objectNumber: PropTypes.number.isRequired,
  channelMapping: PropTypes.string.isRequired,
  // label: PropTypes.string.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string,
    error: PropTypes.string,
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
  expanded: PropTypes.bool.isRequired,
  onChangeField: PropTypes.func.isRequired,
  objectsList: PropTypes.arrayOf(PropTypes.shape({
    objectNumber: PropTypes.number,
    label: PropTypes.string,
  })).isRequired,
};

ObjectRow.defaultProps = {
  file: null,
  zones: [],
};

export default ObjectRow;
