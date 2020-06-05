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
import BehaviourSettingsModal from './BehaviourSettingsModal';
import {
  setObjectPanning,
  deleteObject,
  addObjectBehaviour,
  deleteObjectBehaviour,
  replaceObjectBehaviourParameters,
} from '../../../../actions/project';

const SequenceObjectTable = ({
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

  // Make sure that any removed objects are also removed from the list of highlighted objects
  useEffect(() => {
    setHighlightedObjects(highlightedObjects.filter(
      objectNumber => objectsList.find(o => o.objectNumber === objectNumber),
    ));
  }, [objectsList, objects]);

  // Determine the state of the select-all checkbox
  const allChecked = highlightedObjects.length > 0
    && highlightedObjects.length === objectsList.length;
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

  // state and handlers for editing behaviour parameters - now in one modal
  const [behaviourSettingsContents, setBehaviourSettingsContents] = useState(null);

  // Called when the save button in the modal is clicked.
  const handleBehaviourSettingsChange = (behaviourParameters) => {
    const {
      objectNumbers,
      edit,
      behaviourType,
      behaviourId,
    } = behaviourSettingsContents;

    if (edit) {
      // Replace the parameters for an existing behaviourId
      objectNumbers.forEach(objectNumber => onReplaceObjectBehaviourParameters(
        objectNumber,
        behaviourId,
        behaviourParameters,
      ));
    } else {
      // Add a new behaviour of the given type and parameters
      objectNumbers.forEach(objectNumber => onAddObjectBehaviour(
        objectNumber,
        behaviourType,
        behaviourParameters,
      ));
    }

    // close the settings modal
    setBehaviourSettingsContents(null);
  };

  // Called when the cancel button in the modal is clicked or when it is closed without saving.
  const handleBehaviourSettingsClose = () => {
    // Discard any pending changes (also do not add the behaviour to objects if it was new),
    // just close the settings modal.
    setBehaviourSettingsContents(null);
  };

  // Called when a behaviour is to be added to some objects; this will open the modal if
  // the behaviour has parameters.
  const handleAddBehaviour = (objectNumbers, behaviourType, behaviourParameters) => {
    if (Object.keys(behaviourParameters).length > 0) { // TODO base check on behaviourTypes info
      // open the behaviour settings modal with the initial default parameters for user to confirm.
      setBehaviourSettingsContents({
        objectNumbers,
        edit: false,
        behaviourType,
        behaviourParameters,
      });
    } else {
      // no parameters, so add the behaviour immediately.
      objectNumbers.forEach(objectNumber => onAddObjectBehaviour(
        objectNumber,
        behaviourType,
        behaviourParameters,
      ));
    }
  };

  const handleEditBehaviour = (objectNumber, behaviourId) => {
    // find the behaviour and its parameters
    const behaviour = objects[objectNumber].objectBehaviours.find(
      b => b.behaviourId === behaviourId,
    );
    if (!behaviour) {
      // TODO - silently failing if the behaviour was not found - better than crashing though!
      return;
    }
    const {
      behaviourType,
      behaviourParameters,
    } = behaviour;

    // open the settings modal with the initial parameters
    setBehaviourSettingsContents({
      objectNumbers: [objectNumber],
      edit: true,
      behaviourId,
      behaviourType,
      behaviourParameters,
    });
  };

  // Handle deleting multiple selected objects
  const deleteHighlighted = () => {
    highlightedObjects.forEach(objectNumber => onDeleteObject(objectNumber));
  };

  // Handle adding a behaviour to the selected objects (from button above the table)
  const addBehaviourToHighlighted = (behaviourType, behaviourParameters) => {
    handleAddBehaviour(highlightedObjects, behaviourType, behaviourParameters);
  };

  // Handle adding a behaviour from the button in an object row.
  // It adds to all selected objects if the row the request comes from is part of the selection.
  const addBehaviourToObject = (objectNumber, behaviourType, behaviourParameters) => {
    if (highlightedObjects.includes(objectNumber)) {
      handleAddBehaviour(highlightedObjects, behaviourType, behaviourParameters);
    } else {
      handleAddBehaviour([objectNumber], behaviourType, behaviourParameters);
    }
  };

  const usedBehaviourTypesSet = new Set();
  highlightedObjects.forEach((objectNumber) => {
    const object = objects[objectNumber];
    if (object) {
      object.objectBehaviours.forEach(({ behaviourType }) => {
        usedBehaviourTypesSet.add(behaviourType);
      });
    }
  });
  const usedBehaviourTypes = [...usedBehaviourTypesSet];

  // Combine object and file data to use for displaying table rows.
  const objectsWithFiles = useMemo(() => objectsList.map(({ objectNumber, label }) => ({
    objectNumber,
    objectBehaviours: objects[objectNumber].objectBehaviours,
    label,
    fileId: objects[objectNumber].fileId,
    file: files[objects[objectNumber].fileId],
    channelMapping: objects[objectNumber].channelMapping,
    panning: objects[objectNumber].panning,
  })), [objectsList, objects, files]);

  // do not render the table if we have no objects.
  if (objectsList.length === 0) {
    return null;
  }

  return (
    <div>
      <Dimmer active={filesLoading} inverted verticalAlign="top">
        { !filesLoadingTotal
          ? <Loader indeterminate inline="centered" content="Checking audio files..." />
          : <Loader inline="centered" content={`Checking audio files (${filesLoadingCompleted}/${filesLoadingTotal})`} />
        }
      </Dimmer>

      { behaviourSettingsContents && (
        <BehaviourSettingsModal
          contents={behaviourSettingsContents}
          onChange={handleBehaviourSettingsChange}
          onClose={handleBehaviourSettingsClose}
          onDelete={() => {}}
          sequencesList={sequencesList}
          controls={controls}
        />
      )}

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
            usedBehaviourTypes={usedBehaviourTypes}
            onAddBehaviourToHighlighted={addBehaviourToHighlighted}
            controls={controls}
          />
          <Table.Body>
            { objectsWithFiles.map((object) => {
              const {
                objectNumber,
              } = object;

              return (
                <ObjectRow
                  {...object}
                  key={objectNumber}
                  highlighted={highlightedObjects.indexOf(objectNumber) !== -1}
                  onAddObjectBehaviour={addBehaviourToObject}
                  onEditObjectBehaviour={handleEditBehaviour}
                  onToggleHighlight={() => toggleHighlight(objectNumber)}
                  {...{
                    onChangePanning,
                    onReplaceObjectBehaviourParameters,
                    onDeleteObjectBehaviour,
                    controls,
                  }}
                />
              );
            })}
          </Table.Body>
        </Table>
      </Container>
    </div>
  );
};

SequenceObjectTable.propTypes = {
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
    files,
    objectsList,
    objects,
    filesLoading,
    filesTaskId,
  } = sequences[sequenceId];

  const { total, completed } = UI.tasks[filesTaskId] || {};

  return {
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
  onChangePanning: (objectNumber, panning) => dispatch(setObjectPanning(
    projectId,
    sequenceId,
    objectNumber,
    panning,
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
