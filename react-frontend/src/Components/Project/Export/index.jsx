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
// import ExportTypeSelection from './ExportTypeSelection';
import ExportModal from './ExportModal';
import AdvancedSettings from './AdvancedSettings';
import {
  requestStartPreview,
  requestExportDistribution,
} from '../../../actions/export';
import {
  openSequencePage,
  openProjectPage,
} from '../../../actions/ui';
import PageTitleBar from '../../PageTitleBar';

const Export = ({
  projectId,
  itemsTaskIds,
  encodeTaskIds,
  reviewItems,
  onStartPreview,
  onOpenSequencePage,
  onOpenProjectPage,
  canExport,
  onExport,
  haveCustomTemplatePath,
}) => (
  <Container>
    <PageTitleBar
      title="Export"
      shortDescription="The experience can be previewed (using devices on the same network) or exported to share elsewhere."
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
                  onReview={item.projectPage
                    ? () => { onOpenProjectPage(projectId, item.projectPage); }
                    : undefined
                  }
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
      { false && (
        <Grid.Column>
          <Header size="small" content="Background tasks" />
          <Table basic>
            <Table.Body>
              <TaskProgress name="Audio analysis" taskIds={itemsTaskIds} />
              <TaskProgress name="Audio transcoding" taskIds={encodeTaskIds} />
            </Table.Body>
          </Table>
        </Grid.Column>
      )}
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

    { haveCustomTemplatePath
      && <Message info header="Custom template configured" content="You are currently using a custom template for the prototype application. Check or reset this setting in the advanced export settings above if it does not work." />}

    <Button
      primary
      disabled={!canExport}
      icon="eye"
      content="Start preview"
      labelPosition="left"
      onClick={() => onStartPreview(projectId)}
    />

    <Button
      primary
      disabled={!canExport}
      icon="share"
      content="Export"
      labelPosition="left"
      onClick={() => onExport(projectId)}
    />

    <ExportModal />
  </Container>
);

/*
    <ExportTypeSelection
      disabled={!canExport}
      projectId={projectId}
    />
*/

Export.propTypes = {
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
  canExport: PropTypes.bool.isRequired,
  haveCustomTemplatePath: PropTypes.bool.isRequired,
  onOpenSequencePage: PropTypes.func.isRequired,
  onOpenProjectPage: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
};

const mapStateToProps = ({ Project }, { projectId }) => {
  const project = Project.projects[projectId] || {};
  const {
    sequencesList,
    sequences,
    reviewItems,
    settings,
  } = project;

  return {
    itemsTaskIds: sequencesList
      .map(({ sequenceId }) => sequences[sequenceId].itemsTaskId)
      .filter(taskId => !!taskId),
    encodeTaskIds: sequencesList
      .map(({ sequenceId }) => sequences[sequenceId].encodeTaskId)
      .filter(taskId => !!taskId),
    reviewItems,
    canExport: reviewItems.every(({ error }) => !error),
    haveCustomTemplatePath: !!settings.customTemplatePath,
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
  onExport: projectId => dispatch(requestExportDistribution(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Export);
