import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Popup,
  Button,
} from 'semantic-ui-react';

import PanningFlag from './PanningFlag';
import ConfirmDeleteButton from '../../../ConfirmDeleteButton';
import Behaviour from './Behaviour';
import AddBehaviourButton from './AddBehaviourButton';

class ObjectRow extends React.PureComponent {
  render() {
    const {
      objectNumber,
      objectBehaviours,
      channelMapping,
      label,
      file,
      onChangePanning,
      onResetObject,
      onDeleteObject,
      onAddObjectBehaviour,
      onDeleteObjectBehaviour,
      onReplaceObjectBehaviourParameters,
    } = this.props;

    return (
      <Table.Row negative={!file || !!file.error} verticalAlign="top">
        <Table.Cell>{objectNumber}</Table.Cell>

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
              }}
            />
          ))}
          <AddBehaviourButton
            onAddBehaviour={behaviourType => onAddObjectBehaviour(objectNumber, behaviourType)}
            usedBehaviourTypes={objectBehaviours.map(({ behaviourType }) => behaviourType)}
          />
        </Table.Cell>

        <Table.Cell singleLine>
          <Button icon="undo" onClick={() => onResetObject(objectNumber)} />
          <ConfirmDeleteButton
            header="Delete Object"
            name={`${label} (object number ${objectNumber})`}
            onDelete={() => onDeleteObject(objectNumber)}
          />
        </Table.Cell>
      </Table.Row>
    );
  }
}

ObjectRow.propTypes = {
  objectNumber: PropTypes.number.isRequired,
  channelMapping: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string,
    error: PropTypes.string,
  }),
  objectBehaviours: PropTypes.arrayOf(PropTypes.shape({
    behaviourType: PropTypes.string.isRequired,
    behaviourParameters: PropTypes.shape({}),
  })).isRequired,
  onChangePanning: PropTypes.func.isRequired,
  onResetObject: PropTypes.func.isRequired,
  onDeleteObject: PropTypes.func.isRequired,
  onAddObjectBehaviour: PropTypes.func.isRequired,
  onDeleteObjectBehaviour: PropTypes.func.isRequired,
  onReplaceObjectBehaviourParameters: PropTypes.func.isRequired,
};

ObjectRow.defaultProps = {
  file: null,
};

export default ObjectRow;
