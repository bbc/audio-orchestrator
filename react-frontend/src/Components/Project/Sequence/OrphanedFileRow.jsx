import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Popup,
} from 'semantic-ui-react';

const OrphanedFileRow = ({
  file,
}) => (
  <Table.Row negative>
    <Table.Cell content="N/A" />
    <Table.Cell>
      <Icon name="exclamation" />
      No corresponding metadata entry.
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
    <Table.Cell content="N/A" />
    <Table.Cell content="N/A" />
    <Table.Cell content="N/A" />
  </Table.Row>
);

OrphanedFileRow.propTypes = {
  file: PropTypes.shape({
    name: PropTypes.string,
    error: PropTypes.string,
  }).isRequired,
};

export default OrphanedFileRow;
