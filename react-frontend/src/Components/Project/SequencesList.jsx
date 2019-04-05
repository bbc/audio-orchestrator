import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Loader,
  Card,
  Button,
} from 'semantic-ui-react';
import SequenceItem from './SequenceItem';

import {
  getSequencesList,
  addSequence,
} from '../../actions/project';

class SequencesList extends React.Component {
  componentDidMount() {
    const { onGetSequencesList } = this.props;
    onGetSequencesList();
  }

  render() {
    const {
      loading,
      sequencesList,
      onAddSequence,
      onOpenSequence,
    } = this.props;

    return (
      <Card.Group stackable itemsPerRow={3}>
        <Loader active={loading} inline="centered" />
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
  }
}

SequencesList.propTypes = {
  loading: PropTypes.bool.isRequired,
  sequencesList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGetSequencesList: PropTypes.func.isRequired,
  onAddSequence: PropTypes.func.isRequired,
  onOpenSequence: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { projectId }) => {
  const {
    sequencesList,
    sequencesListLoading,
  } = state.Project.projects[projectId];

  return {
    loading: sequencesListLoading,
    sequencesList,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onGetSequencesList: () => dispatch(getSequencesList(projectId)),
  onAddSequence: () => dispatch(addSequence(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequencesList);
