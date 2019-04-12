import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Segment,
  Table,
  Icon,
  Header,
  Message,
} from 'semantic-ui-react';

import { requestReplaceMetadata } from '../../actions/project';

const Metadata = ({
  objects,
  files,
  objectsList,
  onReplaceMetadata,
}) => {
  if (objectsList.length === 0) {
    return (
      <Segment attached placeholder textAlign="center">
        <Header icon>
          <Icon name="file code outline" />
          Add metadata
          <Header.Subheader>
            {'The metadata file should have an entry for every object, where the object number corresponds to an audio file.'}
          </Header.Subheader>
        </Header>
        <Button primary icon="folder open" content="Load metadata file" labelPosition="left" onClick={onReplaceMetadata} />
      </Segment>
    );
  }

  const objectsWithFiles = objectsList.map(({ objectNumber, label }) => ({
    objectNumber,
    label,
    file: files[objects[objectNumber].fileId],
    channelMapping: objects[objectNumber].channelMapping,
  }));

  return (
    <Segment attached>
      { !objectsWithFiles.every(({ file }) => !!file)
        ? (
          <Message negative>
            <Icon name="exclamation" />
            {'Not all objects have an associated audio file. Check that all audio files have been added and are named according to their object number.'}
          </Message>
        )
        : null
      }
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            <Table.HeaderCell>Label</Table.HeaderCell>
            <Table.HeaderCell>Matching audio file</Table.HeaderCell>
            <Table.HeaderCell>Channel mapping</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { objectsWithFiles.map(({
            objectNumber,
            channelMapping,
            label,
            file,
          }) => (
            <Table.Row negative={!file} key={objectNumber}>
              <Table.Cell>{objectNumber}</Table.Cell>
              <Table.Cell>{label}</Table.Cell>
              { file
                ? <Table.Cell>{file.name}</Table.Cell>
                : (
                  <Table.Cell>
                    <Icon name="exclamation" />
                    No audio file name matches the object number.
                  </Table.Cell>
                )
              }
              <Table.Cell>{channelMapping}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Button.Group>
        <Button
          negative
          icon="refresh"
          labelPosition="left"
          content="Replace metadata file"
          onClick={onReplaceMetadata}
        />
      </Button.Group>
    </Segment>
  );
};

Metadata.propTypes = {
  objectsList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onReplaceMetadata: PropTypes.func.isRequired,
  objects: PropTypes.shape({
    fileId: PropTypes.string,
  }).isRequired,
  files: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = ({ Project }, { projectId, sequenceId }) => {
  const project = Project.projects[projectId] || {};
  const sequence = project.sequences[sequenceId] || {};

  return {
    objectsList: sequence.objectsList || [],
    objects: sequence.objects || {},
    files: sequence.files || {},
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onReplaceMetadata: () => { dispatch(requestReplaceMetadata(projectId, sequenceId)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(Metadata);
