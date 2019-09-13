import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Menu,
  Header,
} from 'semantic-ui-react';

import SequenceHeader from './SequenceHeader';
import SequenceObjectTable from './SequenceObjectTable';
import SequenceSettings from './SequenceSettings';
import SequenceChoices from './SequenceChoices';
import EditableMenuHeader from '../EditableMenuHeader';
import { setSequenceSetting } from '../../../actions/project';
import { closeSequencePage } from '../../../actions/ui';

const Sequence = ({
  sequenceId,
  projectId,
  name,
  onSetName,
  onCloseSequence,
}) => (
  <div>
    <Container>
      <Menu inverted color="green">
        <EditableMenuHeader value={name} onChange={onSetName} />
        <Menu.Item position="right" icon="close" content="close" onClick={onCloseSequence} />
      </Menu>
      <Header content="Objects" subheader="Add audio files and specify metadata that determine if and on which devices the objects are rendered." />
      <SequenceHeader {...{ sequenceId, projectId }} />
    </Container>
    <SequenceObjectTable {...{ sequenceId, projectId }} />
    <Container>
      <Header content="Behaviour" subheader="Specify whether the sequence is looped, and when the choices will be displayed." />
      <SequenceSettings {...{ sequenceId, projectId }} />
      <Header content="Choices" subheader="Specify choices for the user to move to another sequence." />
      <SequenceChoices {...{ sequenceId, projectId }} />
    </Container>
  </div>
);

Sequence.propTypes = {
  projectId: PropTypes.string.isRequired,
  sequenceId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onCloseSequence: PropTypes.func.isRequired,
  onSetName: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const project = state.Project.projects[projectId];
  const { name } = project.sequences[sequenceId];

  return ({
    name,
  });
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onSetName: name => dispatch(setSequenceSetting(projectId, sequenceId, 'name', name)),
  onCloseSequence: () => dispatch(closeSequencePage()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Sequence);
