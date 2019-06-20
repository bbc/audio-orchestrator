import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Menu,
} from 'semantic-ui-react';

import SequenceHeader from './SequenceHeader';
import SequenceObjectTable from './SequenceObjectTable';
import SequenceSettings from './SequenceSettings';

import EditableMenuHeader from '../EditableMenuHeader';
import { setSequenceSetting } from '../../../actions/project';

import {
  closeSequencePage,
} from '../../../actions/ui';

const Sequence = ({
  sequenceId,
  projectId,
  name,
  onSetName,
  onCloseSequence,
}) => (
  <Container>
    <Menu inverted color="green" attached="top">
      <EditableMenuHeader value={name} onChange={onSetName} />
      <Menu.Item position="right" icon="close" content="close" onClick={onCloseSequence} />
    </Menu>
    <SequenceHeader {...{ sequenceId, projectId }} />
    <SequenceObjectTable {...{ sequenceId, projectId }} />
    <SequenceSettings {...{ sequenceId, projectId }} />
  </Container>
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
