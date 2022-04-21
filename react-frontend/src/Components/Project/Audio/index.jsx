import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Message,
  Tab,
  Menu,
} from 'semantic-ui-react';
import {
  openSequencePage,
} from 'Actions/ui';
import PageTitleBar from '../../PageTitleBar';

import Sequence from './Sequence';

const Audio = ({
  currentProjectId,
  currentSequenceId,
  sequencesList,
  onOpenSequence,
}) => {
  const tabPanes = sequencesList.map(({ name, sequenceId }) => ({
    sequenceId,
    menuItem: <Menu.Item key={sequenceId} content={name} />,
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
        title="Audio"
        shortDescription="For each sequence, import audio files and add object metadata to define how each object should be allocated to devices."
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

Audio.defaultProps = {
  currentSequenceId: null,
};

Audio.propTypes = {
  currentProjectId: PropTypes.string.isRequired,
  currentSequenceId: PropTypes.string,
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.string,
    name: PropTypes.string,
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

export default connect(mapStateToProps, mapDispatchToProps)(Audio);
