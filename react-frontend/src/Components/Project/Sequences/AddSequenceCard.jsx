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
} from '#Actions/project.js';

// TODO: Ideally would like this to look like the controls equivalent
// But can't use placeholder as it's too tall?
function AddSequenceCard({
  onAddSequence,
}) {
  return (
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
          <Header content="More sequences" subheader="You can add as many sequences as you need." />
          <Button primary icon="plus" content="Add sequence" onClick={onAddSequence} labelPosition="left" />
        </Segment>
      </Card.Content>
    </Card>
  );
}

AddSequenceCard.propTypes = {
  onAddSequence: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onAddSequence: () => dispatch(requestAddSequence(projectId)),
});

export default connect(null, mapDispatchToProps)(AddSequenceCard);
