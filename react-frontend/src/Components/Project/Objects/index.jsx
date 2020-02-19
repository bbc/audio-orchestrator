import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Message,
  Tab,
} from 'semantic-ui-react';
import PageTitleBar from '../../PageTitleBar';

import Sequence from './Sequence';
import {
  openSequencePage,
} from '../../../actions/ui';

const Objects = ({
  currentProjectId,
  currentSequenceId,
  sequencesList,
  onOpenSequence,
}) => {
  const tabPanes = sequencesList.map(({ name, sequenceId }) => ({
    sequenceId,
    menuItem: name,
    render: () => (
      <Tab.Pane>
        <Sequence projectId={currentProjectId} sequenceId={sequenceId} />
      </Tab.Pane>
    ),
  }));

  const defaultIndex = tabPanes.findIndex(({
    sequenceId,
  }) => sequenceId === currentSequenceId);

  const handleTabChange = (e, { activeIndex }) => {
    const { sequenceId } = tabPanes[activeIndex];
    onOpenSequence(sequenceId);
  };

  return (
    <Container>
      <PageTitleBar
        title="Audio objects"
        shortDescription="Import audio files and add object metadata for each sequence to define how each object should be rendered."
        helpId="objects"
      />
      <Tab
        panes={tabPanes}
        activeIndex={defaultIndex}
        onTabChange={handleTabChange}
      />
      { sequencesList.length === 0
        ? <Message>No sequences in this project; create them on the Sequences page.</Message>
        : null
      }
    </Container>
  );
};

Objects.defaultProps = {
  currentSequenceId: null,
};

Objects.propTypes = {
  currentProjectId: PropTypes.string.isRequired,
  currentSequenceId: PropTypes.string,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.String,
    name: PropTypes.String,
  })).isRequired,
  onOpenSequence: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { UI, Project } = state;

  const {
    currentProjectId,
    currentSequenceId,
  } = UI;

  const {
    sequencesList,
  } = Project.projects[currentProjectId];

  const defaultSequenceId = ((sequencesList || [])[0] || {}).sequenceId;

  return {
    currentProjectId,
    currentSequenceId: currentSequenceId || defaultSequenceId,
    sequencesList,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onOpenSequence: sequenceId => dispatch(openSequencePage(projectId, sequenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Objects);
