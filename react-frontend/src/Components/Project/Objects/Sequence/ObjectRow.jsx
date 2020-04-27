import React from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Icon,
  Popup,
  Checkbox,
} from 'semantic-ui-react';

import PanningControl from './PanningControl';
import Behaviour from './Behaviour';
import AddBehaviourButton from './AddBehaviourButton';

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
      onDeleteObjectBehaviour,
      highlighted,
      onToggleHighlight,
    } = this.props;

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
            <Table.Cell collapsing onClick={onToggleHighlight}>
              <Icon name="exclamation" />
              No audio file matches the object number.
            </Table.Cell>
          )
        }

        <Table.Cell singleLine collapsing>
          <PanningControl
            channelMapping={channelMapping}
            panning={panning}
            onChange={onChangePanning}
            objectNumber={objectNumber}
          />
        </Table.Cell>

        <Table.Cell colSpan="2">
          {objectBehaviours.map(behaviour => (
            <Behaviour
              key={behaviour.behaviourId}
              behaviourType={behaviour.behaviourType}
              onEdit={() => onEditObjectBehaviour(objectNumber, behaviour.behaviourId)}
              onDelete={() => onDeleteObjectBehaviour(objectNumber, behaviour.behaviourId)}
            />
          ))}
          <AddBehaviourButton
            onAddBehaviour={(behaviourType, behaviourParameters) => {
              onAddObjectBehaviour(objectNumber, behaviourType, behaviourParameters);
            }}
            usedBehaviourTypes={objectBehaviours.map(({ behaviourType }) => behaviourType)}
            text="Add..."
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
  onEditObjectBehaviour: PropTypes.func.isRequired,
  onDeleteObjectBehaviour: PropTypes.func.isRequired,
  highlighted: PropTypes.bool,
  onToggleHighlight: PropTypes.func.isRequired,
};

ObjectRow.defaultProps = {
  file: null,
  highlighted: false,
};

export default ObjectRow;
