import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Checkbox,
} from 'semantic-ui-react';

import Behaviours from '#Lib/Behaviours.js';
import InlineHelpPopup from '#Components/InlineHelpPopup.jsx';
import PanningControl from './PanningControl.jsx';
import Behaviour from './Behaviour.jsx';
import AddBehaviourButton from './AddBehaviourButton.jsx';
import FixedBehaviour from './FixedBehaviour.jsx';

class ObjectRow extends React.PureComponent {
  render() {
    const {
      objectNumber,
      objectBehaviours,
      channelMapping,
      panning,
      // label,
      file,
      onChangePanning,
      onAddObjectBehaviour,
      onEditObjectBehaviour,
      onReplaceObjectBehaviourParameters,
      onDeleteObjectBehaviour,
      highlighted,
      onToggleHighlight,
      controls,
    } = this.props;

    const annotatedBehaviours = Behaviours.getAnnotatedObjectBehaviours(objectBehaviours);

    const isStereo = file && file.probe && file.probe.numChannels === 2;

    return (
      <Table.Row negative={!file || !!file.error} verticalAlign="top" active={highlighted}>
        <Table.Cell onClick={onToggleHighlight} singleLine collapsing>
          <Checkbox checked={highlighted} />
        </Table.Cell>

        { file
          ? (
            <Table.Cell collapsing onClick={onToggleHighlight}>
              { !file.error
                ? <span>{file.name}</span>
                : (
                  <InlineHelpPopup content={file.error}>
                    <Icon name="exclamation" />
                    {file.name}
                  </InlineHelpPopup>
                )}
            </Table.Cell>
          )
          : (
            <Table.Cell collapsing onClick={onToggleHighlight}>
              <InlineHelpPopup content="No replacement audio file was selected. You can delete this object if it is no longer required.">
                <Icon name="exclamation" />
                <i>No audio file.</i>
              </InlineHelpPopup>
            </Table.Cell>
          )}

        <Table.Cell singleLine collapsing>
          <PanningControl
            channelMapping={isStereo ? 'stereo' : channelMapping}
            panning={panning}
            onChange={onChangePanning}
            objectNumber={objectNumber}
          />
        </Table.Cell>

        <Table.Cell colSpan="2">
          {annotatedBehaviours.map(({
            behaviourId,
            behaviourType,
            behaviourParameters,
            fixed,
          }) => {
            if (fixed) {
              return (
                <FixedBehaviour
                  key={behaviourId}
                  behaviourType={behaviourType}
                  behaviourParameters={behaviourParameters}
                  onChange={(newBehaviourParameters) => onReplaceObjectBehaviourParameters(
                    objectNumber,
                    behaviourId,
                    newBehaviourParameters,
                  )}
                />
              );
            }
            return (
              <Behaviour
                key={behaviourId}
                behaviourType={behaviourType}
                controls={controls}
                onEdit={() => onEditObjectBehaviour(objectNumber, behaviourId)}
                onDelete={() => onDeleteObjectBehaviour(objectNumber, behaviourId)}
              />
            );
          })}
          <AddBehaviourButton
            onAddBehaviour={(behaviourType, behaviourParameters) => {
              onAddObjectBehaviour(objectNumber, behaviourType, behaviourParameters);
            }}
            usedBehaviourTypes={objectBehaviours.map(({ behaviourType }) => behaviourType)}
            controls={controls}
          />
        </Table.Cell>
      </Table.Row>
    );
  }
}

ObjectRow.propTypes = {
  objectNumber: PropTypes.number.isRequired,
  channelMapping: PropTypes.string.isRequired,
  panning: PropTypes.number.isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  // label: PropTypes.string.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string,
    error: PropTypes.string,
    probe: PropTypes.shape({
      numChannels: PropTypes.number,
    }),
  }),
  objectBehaviours: PropTypes.arrayOf(PropTypes.shape({
    behaviourType: PropTypes.string.isRequired,
    behaviourParameters: PropTypes.shape({}),
  })).isRequired,
  onChangePanning: PropTypes.func.isRequired,
  onAddObjectBehaviour: PropTypes.func.isRequired,
  onEditObjectBehaviour: PropTypes.func.isRequired,
  onReplaceObjectBehaviourParameters: PropTypes.func.isRequired,
  onDeleteObjectBehaviour: PropTypes.func.isRequired,
  highlighted: PropTypes.bool,
  onToggleHighlight: PropTypes.func.isRequired,
};

ObjectRow.defaultProps = {
  file: null,
  highlighted: false,
  controls: [],
};

export default ObjectRow;
