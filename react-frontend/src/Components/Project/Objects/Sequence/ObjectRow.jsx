import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Popup,
  Checkbox,
} from 'semantic-ui-react';

import PanningFlag from './PanningFlag';
import Behaviour from './Behaviour';
import AddBehaviourButton from './AddBehaviourButton';

class ObjectRow extends React.PureComponent {
  render() {
    const {
      objectNumber,
      objectBehaviours,
      channelMapping,
      // label,
      file,
      onChangePanning,
      onAddObjectBehaviour,
      onDeleteObjectBehaviour,
      onReplaceObjectBehaviourParameters,
      sequencesList,
      controls,
      highlighted,
      onToggleHighlight,
    } = this.props;

    return (
      <Table.Row negative={!file || !!file.error} verticalAlign="top" active={highlighted}>
        <Table.Cell onClick={onToggleHighlight} singleLine>
          <Checkbox checked={highlighted} label={objectNumber} />
        </Table.Cell>

        { file
          ? (
            <Table.Cell>
              { !file.error
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
          )
          : (
            <Table.Cell>
              <Icon name="exclamation" />
              No audio file matches the object number.
            </Table.Cell>
          )
        }

        <Table.Cell singleLine>
          <PanningFlag
            channelMapping={channelMapping}
            onChange={onChangePanning}
            objectNumber={objectNumber}
          />
        </Table.Cell>

        <Table.Cell>
          {objectBehaviours.map(behaviour => (
            <Behaviour
              key={behaviour.behaviourId}
              {...behaviour}
              {...{
                onDelete: () => onDeleteObjectBehaviour(objectNumber, behaviour.behaviourId),
                onReplaceParameters: parameters => onReplaceObjectBehaviourParameters(
                  objectNumber, behaviour.behaviourId, parameters,
                ),
                sequencesList,
                controls,
              }}
            />
          ))}
          <AddBehaviourButton
            onAddBehaviour={(behaviourType, behaviourParameters) => {
              onAddObjectBehaviour(objectNumber, behaviourType, behaviourParameters);
            }}
            usedBehaviourTypes={objectBehaviours.map(({ behaviourType }) => behaviourType)}
          />
        </Table.Cell>
      </Table.Row>
    );
  }
}

ObjectRow.propTypes = {
  objectNumber: PropTypes.number.isRequired,
  channelMapping: PropTypes.string.isRequired,
  // label: PropTypes.string.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string,
    error: PropTypes.string,
  }),
  objectBehaviours: PropTypes.arrayOf(PropTypes.shape({
    behaviourType: PropTypes.string.isRequired,
    behaviourParameters: PropTypes.shape({}),
  })).isRequired,
  onChangePanning: PropTypes.func.isRequired,
  onAddObjectBehaviour: PropTypes.func.isRequired,
  onDeleteObjectBehaviour: PropTypes.func.isRequired,
  onReplaceObjectBehaviourParameters: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  highlighted: PropTypes.bool,
  onToggleHighlight: PropTypes.func.isRequired,
};

ObjectRow.defaultProps = {
  file: null,
  highlighted: false,
};

export default ObjectRow;
