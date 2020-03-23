import React, { useMemo, useState, useEffect } from 'react';
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
  deleteObject,
  addObjectBehaviour,
  deleteObjectBehaviour,
  replaceObjectBehaviourParameters,
} from '../../../../actions/project';

const SequenceObjectTable = ({
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
  onDeleteObject,
  sequencesList,
  controls,
}) => {
  // Remember which object rows are currently highlighted (selected)
  const [highlightedObjects, setHighlightedObjects] = useState([]);

  // Clear the highlights list if any object is modified, added, or deleted.
  useEffect(() => {
    setHighlightedObjects([]);
  }, [objectsList, objects]);

  // Determine the state of the select-all checkbox
  const allChecked = highlightedObjects.length === objectsList.length;
  const allIndeterminate = highlightedObjects.length > 0 && !allChecked;

  // Handle all rows being (un-)highlighted
  const toggleAllHighlights = () => {
    if (allChecked || allIndeterminate) {
      setHighlightedObjects([]);
    } else {
      setHighlightedObjects(objectsList.map(({ objectNumber }) => objectNumber));
    }
  };

  // Handle a single row being (un-)highlighted
  const toggleHighlight = (objectNumber) => {
    const highlighted = highlightedObjects.indexOf(objectNumber) !== -1;
    setHighlightedObjects([
      ...highlightedObjects.filter(h => h !== objectNumber),
      ...(highlighted ? [] : [objectNumber]),
    ]);
  };

  // Handle deleting multiple selected objects
  const deleteHighlighted = () => {
    highlightedObjects.forEach(objectNumber => onDeleteObject(objectNumber));
  };

  // Combine object and file data to use for displaying table rows.
  const objectsWithFiles = useMemo(() => objectsList.map(({ objectNumber, label }) => ({
    objectNumber,
    objectBehaviours: objects[objectNumber].objectBehaviours,
    label,
    fileId: objects[objectNumber].fileId,
    file: files[objects[objectNumber].fileId],
    channelMapping: objects[objectNumber].channelMapping,
  })), [objectsList, objects, files]);

  // do not render the table if no files are available.
  // TODO shouldn't this use objectsList instead?
  if (!filesList || filesList.length === 0) {
    return null;
  }

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
          verticalAlign="top"
        >
          <ObjectHeader
            indeterminate={allIndeterminate}
            checked={allChecked}
            onToggleAllHighlights={toggleAllHighlights}
            onDeleteHighlighted={deleteHighlighted}
          />
          <Table.Body>
            { objectsWithFiles.map(object => (
              <ObjectRow
                key={object.objectNumber}
                highlighted={highlightedObjects.indexOf(object.objectNumber) !== -1}
                onToggleHighlight={() => toggleHighlight(object.objectNumber)}
                {...{
                  onChangePanning,
                  onAddObjectBehaviour,
                  onReplaceObjectBehaviourParameters,
                  onDeleteObjectBehaviour,
                  sequencesList,
                  controls,
                }}
                {...object}
              />
            ))}
          </Table.Body>
        </Table>
      </Container>
    </div>
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
  onChangePanning: PropTypes.func.isRequired,
  onAddObjectBehaviour: PropTypes.func.isRequired,
  onDeleteObjectBehaviour: PropTypes.func.isRequired,
  onReplaceObjectBehaviourParameters: PropTypes.func.isRequired,
  onDeleteObject: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

SequenceObjectTable.defaultProps = {
  filesLoadingCompleted: 0,
  filesLoadingTotal: 0,
};

const mapStateToProps = ({ Project, UI }, { projectId, sequenceId }) => {
  const project = Project.projects[projectId];
  const {
    sequences,
    sequencesList,
    controls,
    controlsList,
  } = project;
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
    controls: controlsList.map(({ controlId }) => controls[controlId]),
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
  onDeleteObject: objectNumber => dispatch(deleteObject(
    projectId,
    sequenceId,
    objectNumber,
  )),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceObjectTable);
