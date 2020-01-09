import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Table,
  Icon,
  Dimmer,
  Loader,
  Message,
  Container,
} from 'semantic-ui-react';
import ObjectHeader from './ObjectHeader';
import ObjectRow from './ObjectRow';
import {
  setObjectPanning,
  resetObjectMetadata,
  deleteObject,
  addObjectBehaviour,
  deleteObjectBehaviour,
  replaceObjectBehaviourParameters,
} from '../../../../actions/project';
import {
  PAGE_PROJECT_CONTROLS,
} from '../../../../reducers/UIReducer';
import {
  openProjectPage,
} from '../../../../actions/ui';

class SequenceObjectTable extends React.Component {
  constructor(props) {
    super(props);

    this.handleOpenTagEditor = this.handleOpenTagEditor.bind(this);
  }

  handleOpenTagEditor() {
    const { onOpenProjectPage } = this.props;

    onOpenProjectPage(PAGE_PROJECT_CONTROLS);
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
      onChangePanning,
      onAddObjectBehaviour,
      onDeleteObjectBehaviour,
      onReplaceObjectBehaviourParameters,
      onResetObject,
      onDeleteObject,
      sequencesList,
    } = this.props;

    // do not render the table if no files are available.
    if (!filesList || filesList.length === 0) {
      return null;
    }

    const objectsWithFiles = objectsList.map(({ objectNumber, label }) => ({
      objectNumber,
      objectBehaviours: objects[objectNumber].objectBehaviours,
      label,
      fileId: objects[objectNumber].fileId,
      file: files[objects[objectNumber].fileId],
      channelMapping: objects[objectNumber].channelMapping,
    }));

    return (
      <div>
        <Dimmer active={filesLoading} inverted verticalAlign="top">
          { !filesLoadingTotal
            ? <Loader indeterminate inline="centered" content="Checking Audio Files" />
            : <Loader inline="centered" content={`Checking Audio Files (${filesLoadingCompleted}/${filesLoadingTotal})`} />
          }
        </Dimmer>

        <Container style={{ margin: '1em 0' }}>
          { !objectsWithFiles.every(({ file }) => !!file)
            ? (
              <Message negative>
                <Icon name="exclamation" />
                {'Not all objects have an associated audio file. Check that all audio files have been added and are named starting with their object number.'}
              </Message>
            )
            : null
          }
        </Container>

        <Container>
          <Table
            unstackable
            definition
            verticalAlign="top"
          >
            <ObjectHeader />
            <Table.Body>
              { objectsWithFiles.map(object => (
                <ObjectRow
                  key={object.objectNumber}
                  {...{
                    onChangePanning,
                    onResetObject,
                    onDeleteObject,
                    onAddObjectBehaviour,
                    onReplaceObjectBehaviourParameters,
                    onDeleteObjectBehaviour,
                    sequencesList,
                  }}
                  {...object}
                />
              ))}
            </Table.Body>
          </Table>
        </Container>
      </div>
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
  onOpenProjectPage: PropTypes.func.isRequired,
  onChangePanning: PropTypes.func.isRequired,
  onAddObjectBehaviour: PropTypes.func.isRequired,
  onDeleteObjectBehaviour: PropTypes.func.isRequired,
  onReplaceObjectBehaviourParameters: PropTypes.func.isRequired,
  onResetObject: PropTypes.func.isRequired,
  onDeleteObject: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
};

SequenceObjectTable.defaultProps = {
  filesLoadingCompleted: 0,
  filesLoadingTotal: 0,
};

const mapStateToProps = ({ Project, UI }, { projectId, sequenceId }) => {
  const project = Project.projects[projectId];
  const { sequences, sequencesList } = project;
  const {
    filesList,
    files,
    objectsList,
    objects,
    filesLoading,
    filesTaskId,
  } = sequences[sequenceId];

  const { total, completed } = UI.tasks[filesTaskId] || {};

  return {
    filesList,
    files,
    objectsList,
    objects,
    filesLoading,
    filesLoadingTotal: total,
    filesLoadingCompleted: completed,
    sequencesList,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onChangePanning: (objectNumber, channelMapping) => dispatch(setObjectPanning(
    projectId,
    sequenceId,
    objectNumber,
    channelMapping,
  )),
  onAddObjectBehaviour: (
    objectNumber,
    behaviourType,
    behaviourParameters,
  ) => dispatch(addObjectBehaviour(
    projectId,
    sequenceId,
    objectNumber,
    behaviourType,
    behaviourParameters,
  )),
  onDeleteObjectBehaviour: (objectNumber, behaviourId) => dispatch(deleteObjectBehaviour(
    projectId,
    sequenceId,
    objectNumber,
    behaviourId,
  )),
  onReplaceObjectBehaviourParameters: (
    objectNumber, behaviourId, behaviourParameters,
  ) => dispatch(replaceObjectBehaviourParameters(
    projectId,
    sequenceId,
    objectNumber,
    behaviourId,
    behaviourParameters,
  )),
  onResetObject: objectNumber => dispatch(resetObjectMetadata(
    projectId,
    sequenceId,
    objectNumber,
  )),
  onDeleteObject: objectNumber => dispatch(deleteObject(
    projectId,
    sequenceId,
    objectNumber,
  )),
  onOpenProjectPage: page => dispatch(openProjectPage(projectId, page)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceObjectTable);
