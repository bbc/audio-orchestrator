import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Grid,
  Header,
} from 'semantic-ui-react';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import EditableText from '../EditableText';
import SequenceSettings from './SequenceSettings';
import SequenceChoices from './SequenceChoices';
import { setSequenceSetting } from '../../../actions/project';

// TODO: The EditableText is very large when it's clicked
const SequenceItem = ({
  name,
  onOpen,
  onDelete,
  sequenceId,
  projectId,
  isIntro,
  onSetName,
}) => (
  <Card color="green">
    <Card.Content style={{ flexGrow: 0 }}>
      <Grid columns="equal">
        <Grid.Column key={1} width={10}>
          <Header>
            {<EditableText value={name} onChange={onSetName} />}
            <Header.Subheader>
              { isIntro ? <Card.Meta content="Initial sequence, the story begins here." /> : null }
            </Header.Subheader>
          </Header>
        </Grid.Column>

        <Grid.Column key={2} textAlign="right">
          <SequenceSettings sequenceId={sequenceId} projectId={projectId} />
        </Grid.Column>
      </Grid>

    </Card.Content>

    <Card.Content>
      <Header size="small" content="Set sequence choices" />
      <SequenceChoices sequenceId={sequenceId} projectId={projectId} />
    </Card.Content>

    <Card.Content extra textAlign="right">
      <ConfirmDeleteButton disabled={isIntro} type="sequence" name={name} onDelete={() => onDelete(sequenceId)} />
      <Button
        icon="edit"
        labelPosition="left"
        content="Open"
        color="green"
        onClick={() => {
          onOpen(sequenceId);
        }}
      />
    </Card.Content>
  </Card>
);

SequenceItem.propTypes = {
  name: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  sequenceId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  isIntro: PropTypes.bool,
  onSetName: PropTypes.func.isRequired,
};

SequenceItem.defaultProps = {
  isIntro: false,
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onSetName: name => dispatch(setSequenceSetting(projectId, sequenceId, 'name', name)),
});

export default connect(null, mapDispatchToProps)(SequenceItem);
