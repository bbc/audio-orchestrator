import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Popup,
} from 'semantic-ui-react';

import PanningFlag from './PanningFlag';
import MdoOnlyFlag from './MdoOnlyFlag';
import SpreadFlag from './SpreadFlag';
// import ThresholdFlag from './ThresholdFlag';
import ExclusivityFlag from './ExclusivityFlag';
import MuteIfFlag from './MuteIfFlag';
import MetadataZoneFlag from './MetadataZoneFlag';

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
      onChangePanning,
    } = this.props;

    const {
      mdoOnly,
      mdoSpread,
      exclusivity,
      // mdoThreshold,
      muteIfObject,
      // onDropin,
      // onDropout,
      // image,
    } = orchestration;

    const flagProps = {
      onChangeField,
      objectNumber,
      expanded: false, // TODO: expanded is not actually used inside these at the moment
    };
    const metadataFlags = [
      <MdoOnlyFlag mdoOnly={mdoOnly} {...flagProps} key="mdoOnly" />,
      <SpreadFlag mdoSpread={mdoSpread} {...flagProps} key="mdoSpread" />,
      <ExclusivityFlag exclusivity={exclusivity} {...flagProps} key="exclusivity" />,
      // <ThresholdFlag mdoThreshold={mdoThreshold} {...flagProps} key="mdoThreshold" />,
      <MuteIfFlag muteIfObject={muteIfObject} objectsList={objectsList} {...flagProps} key="muteIf" />,
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
        N/A
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

        <Table.Cell>
          <PanningFlag
            channelMapping={channelMapping}
            onChange={onChangePanning}
            objectNumber={objectNumber}
          />
        </Table.Cell>

        { expanded
          ? (
            metadataFlags.map(f => (
              <Table.Cell textAlign="center" key={f.key} content={f} />
            ))
          )
          : (
            <Table.Cell content={metadataFlags} />
          )
        }

        { expanded
          ? zoneFlags.map(f => (
            <Table.Cell textAlign="center" key={f.key} content={f} />
          ))
          : (
            <Table.Cell content={zoneFlags} />
          )
        }
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
    // mdoThreshold: PropTypes.number,
    muteIfObject: PropTypes.number,
    // onDropin: PropTypes.number,
    // onDropout: PropTypes.number,
    // image: PropTypes.string,
  }).isRequired,
  zones: PropTypes.arrayOf(PropTypes.shape({
    zoneId: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
  })),
  expanded: PropTypes.bool.isRequired,
  onChangeField: PropTypes.func.isRequired,
  onChangePanning: PropTypes.func.isRequired,
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
