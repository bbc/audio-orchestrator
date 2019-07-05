import React from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  Icon,
} from 'semantic-ui-react';

const ObjectHeader = ({
  expanded,
  zones,
  onEditTags,
}) => (
  <Table.Header>
    { expanded
      ? (
        <Table.Row>
          <Table.HeaderCell collapsing>#</Table.HeaderCell>
          <Table.HeaderCell>Audio file</Table.HeaderCell>
          <Table.HeaderCell>Panning</Table.HeaderCell>
          <Table.HeaderCell content="Exclusive" />
          <Table.HeaderCell content="Auxiliary only" />
          <Table.HeaderCell content="Spread" />
          <Table.HeaderCell content="Threshold" />
          <Table.HeaderCell content="Mute if" />
          { (!zones || zones.length === 0)
            ? (
              <Table.HeaderCell>
                Device tags
                {' '}
                <Icon name="cog" link onClick={onEditTags} />
              </Table.HeaderCell>
            )
            : null
          }
          { zones.map(({ zoneId, name }, i) => (
            <Table.HeaderCell key={zoneId}>
              {name}
              {' '}
              { (i === zones.length - 1)
                ? <Icon name="cog" link onClick={onEditTags} />
                : null
              }
            </Table.HeaderCell>
          ))}
          <Table.HeaderCell content="Image" />
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
          <Table.HeaderCell content="Image" />
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
