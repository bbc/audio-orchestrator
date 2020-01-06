import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Popup,
  Table,
  Divider,
} from 'semantic-ui-react';
import BehaviourParameter from './BehaviourParameter';
import behaviourTypes from './behaviourTypes';

class Behaviour extends React.PureComponent {
  constructor(props) {
    super(props);
    this.replaceParameter = this.replaceParameter.bind(this);
  }

  replaceParameter({ name, value }) {
    const {
      onReplaceParameters,
      behaviourParameters,
    } = this.props;

    onReplaceParameters({
      ...behaviourParameters,
      [name]: value,
    });
  }

  render() {
    const {
      behaviourType,
      behaviourParameters,
      onDelete,
    } = this.props;

    const {
      displayName,
      description,
      parameters,
      color,
    } = behaviourTypes.find(({ name }) => name === behaviourType);

    return (
      <Popup
        trigger={(
          <Button
            content={displayName}
            basic
            size="small"
            compact
            color={color}
            style={{ marginBottom: '2px' }}
          />
        )}
        wide="very"
        on="click"
      >
        <Popup.Header>
          {displayName}
          <Button icon="trash" floated="right" basic size="tiny" compact onClick={onDelete} />
        </Popup.Header>
        <Popup.Content>
          {description}
          {parameters ? <Divider /> : null }
          {parameters
            ? (
              <Table definition>
                <Table.Body>
                  {parameters.map(parameter => (
                    <BehaviourParameter
                      key={parameter.name}
                      {...parameter}
                      value={behaviourParameters[parameter.name]}
                      onChange={(e, data) => this.replaceParameter({
                        name: parameter.name,
                        value: data.value,
                      })}
                    />
                  ))}
                </Table.Body>
              </Table>
            )
            : null
          }
        </Popup.Content>
      </Popup>
    );
  }
}

Behaviour.propTypes = {
  behaviourType: PropTypes.string.isRequired,
  behaviourParameters: PropTypes.shape({}),
  onDelete: PropTypes.func.isRequired,
  onReplaceParameters: PropTypes.func.isRequired,
};

Behaviour.defaultProps = {
  behaviourParameters: {},
};

export default Behaviour;
