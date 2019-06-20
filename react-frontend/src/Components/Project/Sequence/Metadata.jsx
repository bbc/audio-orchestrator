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
  Label,
  Grid,
} from 'semantic-ui-react';

import MetadataRow from './MetadataRow';
import { requestReplaceMetadata } from '../../../actions/project';
import { PAGE_PROJECT_RULES } from '../../../reducers/UIReducer';
import { openProjectPage } from '../../../actions/ui';

const Metadata = ({
  objects,
  files,
  objectsList,
  onReplaceMetadata,
  onReviewTags,
  sequenceMetadataConfirmation,
  sequenceMetadataError,
  zones,
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
        <Button primary icon="folder open" content="Load metadata file" onClick={onReplaceMetadata} />
        { sequenceMetadataError
          ? (
            <div>
              <Label pointing="above" basic color="red" content={sequenceMetadataError} />
            </div>
          )
          : null
        }
      </Segment>
    );
  }

  const objectsWithFiles = objectsList.map(({ objectNumber, label }) => ({
    objectNumber,
    label,
    orchestration: objects[objectNumber].orchestration,
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
      { (!zones || zones.length === 0)
        ? (
          <Message warning>
            <Icon name="exclamation" />
            {'No device tags have been defined for the project. These are needed for the object placement algorithm and must match the metadata files for all sequences.'}
            <p><Button content="Edit custom tags" onClick={onReviewTags} /></p>
          </Message>
        )
        : null
      }
      <Table singleLine verticalAlign="top">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            <Table.HeaderCell>Object Label</Table.HeaderCell>
            <Table.HeaderCell>Matched file</Table.HeaderCell>
            <Table.HeaderCell>Channel mapping</Table.HeaderCell>
            <Table.HeaderCell content="Placement rules" />
            <Table.HeaderCell content="Device tags" />
            <Table.HeaderCell content="Image" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { objectsWithFiles.map(({
            objectNumber,
            channelMapping,
            label,
            file,
            orchestration,
          }) => (
            <MetadataRow
              {...{
                objectNumber,
                channelMapping,
                label,
                file,
                orchestration,
                zones,
              }}
              key={objectNumber}
            />
          ))}
        </Table.Body>
      </Table>
      <Button
        primary
        icon="folder open"
        content="Replace metadata file"
        onClick={onReplaceMetadata}
        label={(sequenceMetadataError || sequenceMetadataConfirmation) ? {
          as: 'a',
          basic: true,
          color: sequenceMetadataError ? 'red' : 'green',
          content: sequenceMetadataError || sequenceMetadataConfirmation,
          pointing: 'left',
          icon: sequenceMetadataError ? '' : 'checkmark',
        } : null}
      />
    </Segment>
  );
};

Metadata.propTypes = {
  objectsList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onReplaceMetadata: PropTypes.func.isRequired,
  sequenceMetadataConfirmation: PropTypes.string,
  sequenceMetadataError: PropTypes.string,
  objects: PropTypes.shape({
    fileId: PropTypes.string,
  }).isRequired,
  files: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  zones: PropTypes.arrayOf(PropTypes.shape({
    zoneId: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
  })),
};

Metadata.defaultProps = {
  sequenceMetadataConfirmation: null,
  sequenceMetadataError: null,
  zones: null,
};

const mapStateToProps = ({ Project, UI }, { projectId, sequenceId }) => {
  const project = Project.projects[projectId] || {};
  const sequence = project.sequences[sequenceId] || {};
  const {
    sequenceMetadataConfirmation,
    sequenceMetadataError,
  } = UI;

  return {
    objectsList: sequence.objectsList || [],
    objects: sequence.objects || {},
    files: sequence.files || {},
    sequenceMetadataConfirmation,
    sequenceMetadataError,
    zones: project.settings.zones || [],
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onReplaceMetadata: () => { dispatch(requestReplaceMetadata(projectId, sequenceId)); },
  onReviewTags: () => { dispatch(openProjectPage(projectId, PAGE_PROJECT_RULES)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(Metadata);
