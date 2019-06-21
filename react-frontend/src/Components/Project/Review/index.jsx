import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Table,
  Container,
  Button,
  Message,
  Header,
  Grid,
} from 'semantic-ui-react';
import SettingsCheck from './SettingsCheck';
import TaskProgress from './TaskProgress';
import ExportTypeSelection from './ExportTypeSelection';
import ExportModal from './ExportModal';
import {
  requestStartPreview,
} from '../../../actions/export';
import {
  openSequencePage,
  openProjectPage,
} from '../../../actions/ui';

const Review = ({
  projectId,
  itemsTaskIds,
  encodeTaskIds,
  reviewItems,
  onStartPreview,
  onOpenSequencePage,
  onOpenProjectPage,
  canExport,
}) => (
  <Container>
    <Message icon="lightbulb outline" header="Preview and export" content="The prototype can be previewed directly on this computer and devices on the same network once all content and settings are filled in." />

    <Grid columns={3} stackable doubling>
      <Grid.Column>
        <Header content="Settings" />
        <Table basic verticalAlign="top">
          <Table.Body>
            { reviewItems
              .filter(item => !item.sequenceId)
              .map(item => (
                <SettingsCheck
                  {...item}
                  projectId={projectId}
                  onReview={() => onOpenProjectPage(projectId, item.projectPage)}
                />
              ))
            }
          </Table.Body>
        </Table>
      </Grid.Column>
      <Grid.Column>
        <Header content="Sequences" />
        <Table basic verticalAlign="top">
          <Table.Body>
            { reviewItems
              .filter(item => !!item.sequenceId)
              .map(item => (
                <SettingsCheck
                  {...item}
                  projectId={projectId}
                  onReview={() => onOpenSequencePage(projectId, item.sequenceId)}
                />
              ))
            }
          </Table.Body>
        </Table>
      </Grid.Column>
      <Grid.Column>
        <Header content="Background tasks" />
        <Table basic>
          <Table.Body>
            <TaskProgress name="Audio analysis" taskIds={itemsTaskIds} />
            <TaskProgress name="Audio transcoding" taskIds={encodeTaskIds} />
          </Table.Body>
        </Table>
      </Grid.Column>
    </Grid>

    <Header content="Export" />
    { !canExport
      ? <Message error header="Not ready to export" content="You must fix the errors highlighted above before you can preview or export the project." icon="delete" />
      : null
    }
    <Button
      primary
      disabled={!canExport}
      icon="eye"
      content="Start Preview"
      onClick={() => onStartPreview(projectId)}
    />

    <ExportTypeSelection
      disabled={!canExport}
      projectId={projectId}
    />

    <ExportModal />
  </Container>
);

Review.propTypes = {
  projectId: PropTypes.string.isRequired,
  itemsTaskIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  encodeTaskIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  reviewItems: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
    error: PropTypes.bool,
    warning: PropTypes.bool,
    sequenceId: PropTypes.string,
    projectPage: PropTypes.string,
  })).isRequired,
  onStartPreview: PropTypes.func.isRequired,
  canExport: PropTypes.bool,
  onOpenSequencePage: PropTypes.func.isRequired,
  onOpenProjectPage: PropTypes.func.isRequired,
};

Review.defaultProps = {
  canExport: false,
};

const mapStateToProps = ({ Project }, { projectId }) => {
  const project = Project.projects[projectId] || {};
  const { sequencesList, sequences, reviewItems } = project;

  return {
    itemsTaskIds: sequencesList
      .map(({ sequenceId }) => sequences[sequenceId].itemsTaskId)
      .filter(taskId => !!taskId),
    encodeTaskIds: sequencesList
      .map(({ sequenceId }) => sequences[sequenceId].encodeTaskId)
      .filter(taskId => !!taskId),
    reviewItems,
    canExport: reviewItems.every(({ error }) => !error),
  };
};

const mapDispatchToProps = dispatch => ({
  onStartPreview: projectId => dispatch(requestStartPreview(projectId)),
  onOpenSequencePage: (projectId, sequenceId) => {
    dispatch(openSequencePage(projectId, sequenceId));
  },
  onOpenProjectPage: (projectId, projectPage) => {
    dispatch(openProjectPage(projectId, projectPage));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Review);
