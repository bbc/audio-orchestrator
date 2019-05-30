import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  Button,
} from 'semantic-ui-react';
import SequenceItem from './SequenceItem';

import {
  requestAddSequence,
} from '../../actions/project';

const SequencesList = ({
  sequencesList,
  onAddSequence,
  onOpenSequence,
}) => (
  <Card.Group stackable itemsPerRow={3}>
    {sequencesList.map(({
      sequenceId,
      name,
      isMain,
      isIntro,
    }) => (
      <SequenceItem
        key={sequenceId}
        sequenceId={sequenceId}
        name={name}
        onOpen={onOpenSequence}
        isMain={isMain}
        isIntro={isIntro}
      />
    ))}
    <Card>
      <Card.Content>
        <Card.Header>Add Sequence</Card.Header>
        <Card.Meta content="Additional sequences can be created but will require custom development and are not supported for previewing in this app." />
      </Card.Content>
      <Card.Content extra textAlign="right">
        <Button icon="plus" content="Add" onClick={onAddSequence} />
      </Card.Content>
    </Card>
  </Card.Group>
);

SequencesList.propTypes = {
  sequencesList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAddSequence: PropTypes.func.isRequired,
  onOpenSequence: PropTypes.func.isRequired,
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
  onAddSequence: () => dispatch(requestAddSequence(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequencesList);
