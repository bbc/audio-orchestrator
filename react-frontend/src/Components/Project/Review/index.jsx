import React from 'react';
import { connect } from 'react-redux';
import {
  Table,
  Container,
  Button,
  Message,
} from 'semantic-ui-react';
import SettingsCheck from './SettingsCheck';
import SequenceCheck from './SequenceCheck';
import TaskProgress from './TaskProgress';
import ExportTypeSelection from './ExportTypeSelection';
import ExportModal from './ExportModal';
import {
  requestStartPreview,
} from '../../../actions/export';

const Review = ({
  projectId,
  sequenceIds,
  itemsTaskIds,
  encodeTaskIds,
  presentationValid,
  presentationError,
  advancedValid,
  requestStartPreview,
}) => (
  <Container>
    <Message icon="lightbulb outline" header="Preview and export" content="The prototype experience can be previewed directly on this computer and devices on the same network. Once you're happy, you can export the encoded audio and source code template to publish or customise further." onDismiss={() => {}} />
    <Table basic collapsing>
      <Table.Body>
        {sequenceIds.map(sequenceId => (
          <SequenceCheck key={sequenceId} projectId={projectId} sequenceId={sequenceId} />
        ))}
        <SettingsCheck name="Presentation settings" valid={presentationValid} error={presentationError} />
        <SettingsCheck name="Advanced settings" valid={advancedValid} />
        <TaskProgress name="Audio analysis" taskIds={itemsTaskIds} />
        <TaskProgress name="Audio transcoding" taskIds={encodeTaskIds} />
      </Table.Body>
    </Table>

    <Button primary icon="eye" content="Start Preview" onClick={() => requestStartPreview(projectId)} />
    <ExportTypeSelection projectId={projectId} />

    <ExportModal />
  </Container>
);

const isUrl = (str) => {
  try {
    /* eslint-disable-next-line no-unused-vars */
    const _ = new URL(str);
    return true;
  } catch (_) {
    return false;
  }
};

const isHostname = str => isUrl(`wss://${str}`) && !str.includes('/') && !str.includes(':');

const mapStateToProps = ({ Project }, { projectId }) => {
  const project = Project.projects[projectId] || {};
  const { sequencesList, sequences, settings } = project;

  const {
    title,
    startLabel,
    introduction,
    joiningLink,
    cloudSyncHostname,
  } = settings;

  const presentationValid = title && startLabel && introduction;
  const presentationError = presentationValid ? null : 'Not all fields have been completed.';

  const advancedValid = (!joiningLink || isUrl(joiningLink))
    && (!cloudSyncHostname || isHostname(cloudSyncHostname));

  return {
    sequenceIds: sequencesList
      .map(({ sequenceId }) => sequenceId),
    itemsTaskIds: sequencesList
      .map(({ sequenceId }) => sequences[sequenceId].itemsTaskId)
      .filter(taskId => !!taskId),
    encodeTaskIds: sequencesList
      .map(({ sequenceId }) => sequences[sequenceId].encodeTaskId)
      .filter(taskId => !!taskId),
    presentationValid,
    presentationError,
    advancedValid,
  };
};

const mapDispatchToProps = dispatch => ({
  requestStartPreview: projectId => dispatch(requestStartPreview(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Review);
