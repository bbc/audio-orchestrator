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
import ZonesModal from './ZonesModal';
import {
  setTableExpanded,
} from '../../../actions/ui';
import {
  setObjectOrchestrationFields,
  deleteZone,
  renameZone,
  addZone,
} from '../../../actions/project';

class SequenceObjectTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tagEditorOpen: false,
    };

    this.handleCloseTagEditor = this.handleCloseTagEditor.bind(this);
    this.handleOpenTagEditor = this.handleOpenTagEditor.bind(this);
  }

  handleCloseTagEditor() {
    this.setState(state => ({ ...state, tagEditorOpen: false }));
  }

  handleOpenTagEditor() {
    this.setState(state => ({ ...state, tagEditorOpen: true }));
  }

  render() {
    const {
      filesList,
      files,
      filesLoading,
      filesLoadingCompleted,
      filesLoadingTotal,
      objectsList,
      objects,
      zones,
      expanded,
      onSetExpanded,
      onChangeField,
      onDeleteZone,
      onAddZone,
      onRenameZone,
    } = this.props;

    const {
      tagEditorOpen,
    } = this.state;

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

    const objectOptions = [
      {
        key: 0,
        value: 0,
        text: '0: none',
      },
      ...objectsList.map(({ objectNumber, label }) => ({
        key: objectNumber,
        value: objectNumber,
        text: `${objectNumber}: ${label}`,
      })),
    ];

    return (
      <Container style={{ overflowX: 'auto' }}>
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
              {'No tags have been defined for the project. These are needed for the object placement algorithm and must match the metadata files for all sequences.'}
              <p><Button content="Edit device tags" onClick={this.handleOpenTagEditor} /></p>
            </Message>
          )
          : null
        }

        <Table singleLine verticalAlign="top" style={{ overflowX: 'auto' }}>
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
                        <Icon name="cog" link onClick={this.handleOpenTagEditor} />
                      </Table.HeaderCell>
                    )
                    : null
                  }
                  { zones.map(({ zoneId, name }, i) => (
                    <Table.HeaderCell key={zoneId}>
                      {name}
                      {' '}
                      { (i === zones.length - 1)
                        ? <Icon name="cog" link onClick={this.handleOpenTagEditor} />
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
                    <Icon name="cog" link onClick={this.handleOpenTagEditor} />
                  </Table.HeaderCell>
                  <Table.HeaderCell content="Image" />
                </Table.Row>
              )
            }
          </Table.Header>
          <Table.Body>
            { objectsWithFiles.map(object => (
              <ObjectRow
                key={object.objectNumber}
                zones={zones}
                expanded={expanded}
                onChangeField={onChangeField}
                objectOptions={objectOptions}
                {...object}
              />
            ))}
            { filesWithoutObjects.map(file => (
              <OrphanedFileRow
                key={file.fileId}
                expanded={expanded}
                zones={zones}
                {...file}
              />
            ))}
          </Table.Body>
        </Table>

        <p>
          { expanded
            ? <Button icon="compress" content="simplify table" onClick={() => onSetExpanded(false)} />
            : <Button icon="expand" content="expand table" onClick={() => onSetExpanded(true)} />
          }
        </p>

        <ZonesModal
          open={tagEditorOpen}
          onClose={this.handleCloseTagEditor}
          zones={zones}
          {...{ onDeleteZone, onAddZone, onRenameZone }}
        />
      </Container>
    );
  }
}

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
  zones: PropTypes.arrayOf(PropTypes.shape({
    zoneId: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
  })),
  onSetExpanded: PropTypes.func.isRequired,
  expanded: PropTypes.bool.isRequired,
  onChangeField: PropTypes.func.isRequired,
};

SequenceObjectTable.defaultProps = {
  filesLoadingCompleted: 0,
  filesLoadingTotal: 0,
  zones: [],
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

  const { expandTable } = UI;

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
    expanded: expandTable,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onSetExpanded: expanded => dispatch(setTableExpanded(expanded)),
  onChangeField: (objectNumber, fields) => dispatch(setObjectOrchestrationFields(
    projectId,
    sequenceId,
    objectNumber,
    fields,
  )),
  onAddZone: name => dispatch(addZone(projectId, name)),
  onRenameZone: (zoneId, friendlyName) => dispatch(renameZone(projectId, zoneId, friendlyName)),
  onDeleteZone: zoneId => dispatch(deleteZone(projectId, zoneId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceObjectTable);
