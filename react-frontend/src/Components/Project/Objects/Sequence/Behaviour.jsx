import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Popup,
  Divider,
} from 'semantic-ui-react';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import BehaviourParameters from './BehaviourParameters';
import behaviourTypes from './behaviourTypes';

const Behaviour = ({
  behaviourParameters,
  behaviourType,
  sequencesList,
  controls,
  onReplaceParameters,
  onDelete,
}) => {
  const [forcedOpen, setForcedOpen] = useState(false);

  // TODO: This might introduce a race condition; should instead send a redux action to guarantee
  // ordering of single parameter updates (instead of sending a whole new parameters object).
  const replaceParameter = ({ name, value }) => {
    onReplaceParameters({
      ...behaviourParameters,
      [name]: value,
    });
  };

  // TODO: Refactor behaviourTypes into an object and a separate ordered list of behaviour names
  // to avoid using find to look up a type by name.
  const {
    displayName,
    description,
    parameters,
    color,
  } = behaviourTypes.find(({ name }) => name === behaviourType);

  const haveParameters = parameters && parameters.length > 0;

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
          icon={haveParameters ? 'ellipsis horizontal' : undefined}
        />
      )}
      open={forcedOpen || undefined}
      wide="very"
      on="click"
    >
      <Popup.Header>
        {displayName}
        {' '}
        <ConfirmDeleteButton
          type="behaviour"
          name={displayName}
          small
          onDelete={onDelete}
          onOpen={() => setForcedOpen(true)}
          onClose={() => setForcedOpen(false)}
        />
      </Popup.Header>
      <Popup.Content>
        {description}
        {haveParameters
          ? <Divider />
          : null
        }
        {haveParameters
          ? (
            <BehaviourParameters
              parameters={parameters}
              values={behaviourParameters}
              onChange={(e, data) => replaceParameter({
                name: data.name,
                value: data.value,
              })}
              sequencesList={sequencesList}
              controls={controls}
            />
          )
          : null
        }
      </Popup.Content>
    </Popup>
  );
};

Behaviour.propTypes = {
  behaviourType: PropTypes.string.isRequired,
  behaviourParameters: PropTypes.shape({}),
  onDelete: PropTypes.func.isRequired,
  onReplaceParameters: PropTypes.func.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
  controls: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

Behaviour.defaultProps = {
  behaviourParameters: {},
};

export default Behaviour;
