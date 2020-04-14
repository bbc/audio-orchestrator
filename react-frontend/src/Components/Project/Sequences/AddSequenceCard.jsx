import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Segment,
  Header,
} from 'semantic-ui-react';

import {
  requestAddSequence,
} from '../../../actions/project';

// TODO: Ideally would like this to look like the controls equivalent
// But can't use placeholder as it's too tall?
const AddSequenceCard = ({
  onAddSequence,
}) => (
  <Card>
    <Card.Content
      style={{ flexGrow: 0 }}
      textAlign="center"
      extra
    >
      <Segment
        placeholder
        style={{ height: '100%', minHeight: '12em' }}
        textAlign="center"
      >
        <Header content="More sequences" subheader="You can add as many sequences as you like..." />
        <Button primary icon="plus" content="Add new sequence" onClick={onAddSequence} labelPosition="left" />
      </Segment>
    </Card.Content>
  </Card>
);

AddSequenceCard.propTypes = {
  onAddSequence: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onAddSequence: () => dispatch(requestAddSequence(projectId)),
});

export default connect(null, mapDispatchToProps)(AddSequenceCard);
