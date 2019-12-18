import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
} from 'semantic-ui-react';
import EditableText from '../EditableText';
import ConfirmDeleteButton from '../../ConfirmDeleteButton';
import SequenceSettings from './SequenceSettings';
import SequenceChoices from './SequenceChoices';
import { setSequenceSetting } from '../../../actions/project';


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
    <Card.Content>
      <Card.Header content={<EditableText value={name} onChange={onSetName} />} />
      { isIntro ? <Card.Meta content="Initial sequence, the story begins here." /> : null }
    </Card.Content>

    <Card.Content>
      <SequenceSettings sequenceId={sequenceId} projectId={projectId} />
    </Card.Content>

    <Card.Content>
      <SequenceChoices sequenceId={sequenceId} projectId={projectId} />
    </Card.Content>

    <Card.Content extra textAlign="right">
      { isIntro
        ? <Button disabled icon="trash" />
        : (
          <ConfirmDeleteButton
            header="Delete Sequence"
            name={name}
            onDelete={() => onDelete(sequenceId)}
          />
        )
      }
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
