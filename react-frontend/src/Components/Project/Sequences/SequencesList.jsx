import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
} from 'semantic-ui-react';
import SequenceItem from './SequenceItem';
import AddSequenceCard from './AddSequenceCard';

import {
  openSequencePage,
} from '../../../actions/ui';

import {
  requestDeleteSequence,
  swapSequenceOrder,
} from '../../../actions/project';

const SequencesList = ({
  sequencesList,
  onOpenSequence,
  onDeleteSequence,
  projectId,
  onSwapSequenceOrder,
}) => {
  const handleMoveSequence = useCallback((i, direction) => {
    const {
      sequenceId,
    } = sequencesList[i];

    const {
      sequenceId: otherSequenceId,
    } = sequencesList[Math.max(0, Math.min(i + direction, sequencesList.length - 1))];

    if (sequenceId !== otherSequenceId) {
      onSwapSequenceOrder(sequenceId, otherSequenceId);
    }
  }, [sequencesList, onSwapSequenceOrder]);

  return (
    <Card.Group stackable doubling itemsPerRow={2}>
      {sequencesList.map(({
        sequenceId,
        name,
        isIntro,
      }, i) => (
        <SequenceItem
          key={sequenceId}
          sequenceId={sequenceId}
          projectId={projectId}
          name={name}
          onOpen={onOpenSequence}
          onDelete={onDeleteSequence}
          isIntro={isIntro}
          onMoveUp={i === 0 ? undefined : () => {
            handleMoveSequence(i, -1);
          }}
          onMoveDown={i === sequencesList.length - 1 ? undefined : () => {
            handleMoveSequence(i, 1);
          }}
        />
      ))}
      <AddSequenceCard projectId={projectId} />
    </Card.Group>
  );
};

SequencesList.propTypes = {
  sequencesList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onOpenSequence: PropTypes.func.isRequired,
  onDeleteSequence: PropTypes.func.isRequired,
  onSwapSequenceOrder: PropTypes.func.isRequired,
  projectId: PropTypes.string.isRequired,
};

const mapStateToProps = (state, { projectId }) => {
  const {
    sequencesList,
  } = state.Project.projects[projectId];

  return {
    sequencesList,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onOpenSequence: sequenceId => dispatch(openSequencePage(projectId, sequenceId)),
  onDeleteSequence: sequenceId => dispatch(requestDeleteSequence(projectId, sequenceId)),
  onSwapSequenceOrder: (
    sequenceId, otherSequenceId,
  ) => dispatch(swapSequenceOrder(projectId, sequenceId, otherSequenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequencesList);
