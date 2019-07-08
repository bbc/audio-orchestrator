import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Popup,
} from 'semantic-ui-react';

const OrphanedFileRow = ({
  file,
  zones,
  expanded,
}) => (
  <Table.Row negative>
    <Table.Cell collapsing>
      <Popup
        trigger={<Icon name="exclamation" />}
        content="No corresponding metadata entry."
      />
    </Table.Cell>

    <Table.Cell>
      {!file.error
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

    <Table.Cell content="N/A" />
    <Table.Cell content="N/A" textAlign={expanded ? 'center' : 'left'} colSpan={expanded ? 4 : undefined} />
    <Table.Cell content="N/A" textAlign={expanded ? 'center' : 'left'} colSpan={expanded ? (zones.length || 1) : undefined} />
  </Table.Row>
);

OrphanedFileRow.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.shape({ zoneId: PropTypes.string })),
  file: PropTypes.shape({
    name: PropTypes.string,
    error: PropTypes.string,
  }).isRequired,
  expanded: PropTypes.bool.isRequired,
};

OrphanedFileRow.defaultProps = {
  zones: [],
};

export default OrphanedFileRow;
