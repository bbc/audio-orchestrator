import React from 'react';
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
} from '../../../actions/project';

const SequencesList = ({
  sequencesList,
  onOpenSequence,
  onDeleteSequence,
  projectId,
}) => (
  <Card.Group stackable doubling itemsPerRow={2}>
    {sequencesList.map(({
      sequenceId,
      name,
      isIntro,
    }) => (
      <SequenceItem
        key={sequenceId}
        sequenceId={sequenceId}
        projectId={projectId}
        name={name}
        onOpen={onOpenSequence}
        onDelete={onDeleteSequence}
        isIntro={isIntro}
      />
    ))}
    <AddSequenceCard projectId={projectId} />
  </Card.Group>
);

SequencesList.propTypes = {
  sequencesList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onOpenSequence: PropTypes.func.isRequired,
  onDeleteSequence: PropTypes.func.isRequired,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(SequencesList);
