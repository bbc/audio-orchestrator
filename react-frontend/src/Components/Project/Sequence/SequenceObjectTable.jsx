import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Button,
  Table,
  Icon,
  Dimmer,
  Loader,
  Message,
  Container,
} from 'semantic-ui-react';
import ObjectRow from './ObjectRow';
import OrphanedFileRow from './OrphanedFileRow';
import { PAGE_PROJECT_RULES } from '../../../reducers/UIReducer';
import { openProjectPage } from '../../../actions/ui';

const SequenceObjectTable = ({
  filesList,
  files,
  filesLoading,
  filesLoadingCompleted,
  filesLoadingTotal,
  objectsList,
  objects,
  zones,
  onReviewTags,
}) => {
  const objectsWithFiles = objectsList.map(({ objectNumber, label }) => ({
    objectNumber,
    label,
    orchestration: objects[objectNumber].orchestration,
    fileId: objects[objectNumber].fileId,
    file: files[objects[objectNumber].fileId],
    channelMapping: objects[objectNumber].channelMapping,
  }));

  const filesWithoutObjects = filesList
    .filter(({ fileId }) => objectsWithFiles.every(o => o.fileId !== fileId))
    .map(({ fileId }) => ({
      fileId,
      file: files[fileId],
    }));

  return (
    <Container>
      <Dimmer active={filesLoading} inverted verticalAlign="top">
        { !filesLoadingTotal
          ? <Loader indeterminate inline="centered" content="Checking Audio Files" />
          : <Loader inline="centered" content={`Checking Audio Files (${filesLoadingCompleted}/${filesLoadingTotal})`} />
        }
      </Dimmer>
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
            <Table.HeaderCell>Object label</Table.HeaderCell>
            <Table.HeaderCell>Audio file</Table.HeaderCell>
            <Table.HeaderCell>Channel mapping</Table.HeaderCell>
            <Table.HeaderCell content="Placement rules" />
            <Table.HeaderCell content="Device tags" />
            <Table.HeaderCell content="Image" />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          { objectsWithFiles.map(object => (
            <ObjectRow
              key={object.objectNumber}
              zones={zones}
              {...object}
            />
          ))}
          { filesWithoutObjects.map(file => (
            <OrphanedFileRow key={file.fileId} {...file} />
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
};

SequenceObjectTable.propTypes = {
  filesList: PropTypes.arrayOf(PropTypes.object).isRequired,
  files: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
  filesLoading: PropTypes.bool.isRequired,
  filesLoadingCompleted: PropTypes.number,
  filesLoadingTotal: PropTypes.number,
  objectsList: PropTypes.arrayOf(PropTypes.object).isRequired,
  objects: PropTypes.shape({
    fileId: PropTypes.string,
  }).isRequired,
  onReviewTags: PropTypes.func.isRequired,
  zones: PropTypes.arrayOf(PropTypes.shape({
    zoneId: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
  })),
};

SequenceObjectTable.defaultProps = {
  filesLoadingCompleted: 0,
  filesLoadingTotal: 0,
  zones: null,
};

const mapStateToProps = ({ Project, UI }, { projectId, sequenceId }) => {
  const project = Project.projects[projectId];
  const { settings, sequences } = project;
  const {
    filesList,
    files,
    objectsList,
    objects,
    filesLoading,
    filesTaskId,
  } = sequences[sequenceId];

  const { zones } = settings;

  const { total, completed } = UI.tasks[filesTaskId] || {};

  return {
    filesList,
    files,
    objectsList,
    objects,
    zones,
    filesLoading,
    filesLoadingTotal: total,
    filesLoadingCompleted: completed,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onReviewTags: () => dispatch(openProjectPage(projectId, PAGE_PROJECT_RULES)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceObjectTable);
