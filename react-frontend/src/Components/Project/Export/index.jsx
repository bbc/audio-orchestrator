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
import AdvancedSettings from './AdvancedSettings';
import {
  requestStartPreview,
} from '../../../actions/export';
import {
  openSequencePage,
  openProjectPage,
} from '../../../actions/ui';
import PageTitleBar from '../../PageTitleBar';

// TODO remove RESTRICTED setting.
// RESTRICTED is set in the webpack config based on an environment variable
/* eslint-disable-next-line no-undef */
const hideFileExport = RESTRICTED;

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
    <PageTitleBar
      title="Preview and export"
      shortDescription="The experience can be previewed directly on this computer and devices on the same network once all content and settings are filled in."
      helpId="export"
    />
    <Header content="Validation" />
    <Grid columns={3} stackable doubling>
      <Grid.Column>
        <Header size="small" content="Settings" />
        <Table basic verticalAlign="top">
          <Table.Body>
            { reviewItems
              .filter(item => !item.sequenceId)
              .map(item => (
                <SettingsCheck
                  {...item}
                  projectId={projectId}
                  editIcon={item.editIcon}
                  onReview={() => onOpenProjectPage(projectId, item.projectPage)}
                />
              ))
            }
          </Table.Body>
        </Table>
      </Grid.Column>
      <Grid.Column>
        <Header size="small" content="Sequences" />
        <Table basic verticalAlign="top">
          <Table.Body>
            { reviewItems
              .filter(item => !!item.sequenceId)
              .map(item => (
                <SettingsCheck
                  {...item}
                  projectId={projectId}
                  editIcon={item.editIcon}
                  onReview={() => {
                    if (item.projectPage) {
                      onOpenProjectPage(projectId, item.projectPage);
                    } else {
                      onOpenSequencePage(projectId, item.sequenceId);
                    }
                  }}
                />
              ))
            }
          </Table.Body>
        </Table>
      </Grid.Column>
      <Grid.Column>
        <Header size="small" content="Background tasks" />
        <Table basic>
          <Table.Body>
            <TaskProgress name="Audio analysis" taskIds={itemsTaskIds} />
            <TaskProgress name="Audio transcoding" taskIds={encodeTaskIds} />
          </Table.Body>
        </Table>
      </Grid.Column>
    </Grid>

    <Header
      content="Export settings"
      subheader="The advanced settings can usually be left at their default values. They may be needed for publishing the exported application more widely."
    />
    <AdvancedSettings projectId={projectId} />

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

    { hideFileExport
      ? null
      : (
        <ExportTypeSelection
          disabled={!canExport}
          projectId={projectId}
        />
      )}

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
