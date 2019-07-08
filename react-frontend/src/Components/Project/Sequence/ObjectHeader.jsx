import React from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  Icon,
  Popup,
} from 'semantic-ui-react';

const flagNameStyle = {
  borderBottom: '1px dashed #ccc',
  cursor: 'help',
};

const metadataFlagNames = [
  <Popup trigger={<span style={flagNameStyle}>Auxiliary Only</span>} content="Specify whether an object is only allowed in connected devices, or can also play from the main device if no suitable auxiliary device exists. To only allow an object into the main device, set all device tags to 'never'." key="mdoOnly" />,
  <Popup trigger={<span style={flagNameStyle}>Spread</span>} content="Specify whether an object is allowed into multiple suitable devices at once." key="mdoSpread" />,
  <Popup trigger={<span style={flagNameStyle}>Exclusive</span>} content="Specify whether an object will be the only one allowed into a certain device." key="exclusivity" />,
  <Popup trigger={<span style={flagNameStyle}>Mute if</span>} content="Specify another object that will mute an object, if the specified other object is playing." key="muteIf" />,
];

const ObjectHeader = ({
  expanded,
  zones,
  onEditTags,
}) => (
  <Table.Header>
    { expanded
      ? (
        <Table.Row>
          <Table.HeaderCell colSpan={3} content="Audio" textAlign="center" />
          <Table.HeaderCell colSpan={metadataFlagNames.length} content="Behaviour" textAlign="center" />
          <Table.HeaderCell colSpan={zones ? zones.length : 1} textAlign="center">
            Device tags
            {' '}
            <Icon name="cog" link onClick={onEditTags} />
          </Table.HeaderCell>
        </Table.Row>
      )
      : null
    }
    { expanded
      ? (
        <Table.Row>
          <Table.HeaderCell collapsing>#</Table.HeaderCell>
          <Table.HeaderCell>Audio file</Table.HeaderCell>
          <Table.HeaderCell>Panning</Table.HeaderCell>
          { metadataFlagNames.map(f => (
            <Table.HeaderCell content={f} key={f.key} />
          ))}
          { (!zones || zones.length === 0)
            ? (
              <Table.HeaderCell>
                No tags defined.
              </Table.HeaderCell>
            )
            : null
          }
          { zones.map(({ zoneId, name }) => (
            <Table.HeaderCell key={zoneId}>
              <Popup trigger={<span style={flagNameStyle}>{name}</span>} content="Specify whether an object should be, could be, or must never be in a device that has selected this tag." />
            </Table.HeaderCell>
          ))}
        </Table.Row>
      ) : (
        <Table.Row>
          <Table.HeaderCell content="#" collapsing />
          <Table.HeaderCell content="Audio file" />
          <Table.HeaderCell content="Panning" />
          <Table.HeaderCell content="Placement rules" />
          <Table.HeaderCell>
            Device tags
            {' '}
            <Icon name="cog" link onClick={onEditTags} />
          </Table.HeaderCell>
        </Table.Row>
      )
    }
  </Table.Header>
);

ObjectHeader.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.shape({
    zoneId: PropTypes.string,
    name: PropTypes.string,
    friendlyName: PropTypes.string,
  })),
  onEditTags: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
};

ObjectHeader.defaultProps = {
  zones: [],
};

export default ObjectHeader;
