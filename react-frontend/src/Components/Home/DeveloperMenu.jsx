import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Modal,
  Menu,
  Header,
  Button,
  List,
  Divider,
} from 'semantic-ui-react';

import {
  requestOpenDevTools,
  requestExportProject,
  requestImportProject,
} from '../../actions/developer';

const DeveloperMenu = ({
  projectsList,
  onOpenDevTools,
  onExportProject,
  onImportProject,
}) => (
  <Modal closeIcon centered={false} trigger={<Menu.Item position="right" icon="cog" />}>
    <Modal.Header content="Developer Tools" />
    <Modal.Content>
      <Header content="Import or export projects" subheader="This isn't implemented yet/very experimental. File paths will need to be manually corrected." />
      <List>
        { projectsList.map(({ projectId, lastOpened, name }) => (
          <List.Item key={projectId}>
            <List.Content floated="left">
              <Button icon="download" onClick={() => onExportProject(projectId)} />
            </List.Content>
            <List.Header content={name} />
            <List.Description content={`${lastOpened} | ${projectId}`} />
          </List.Item>
        ))}
      </List>
      <Button primary icon="plus" content="Import project" onClick={onImportProject} />

      <Divider />

      <Button primary icon="cogs" content="Open Developer Tools" onClick={onOpenDevTools} />
    </Modal.Content>
  </Modal>
);

DeveloperMenu.propTypes = {
  projectsList: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    projectId: PropTypes.string,
    lastOpened: PropTypes.string,
  })).isRequired,
  onOpenDevTools: PropTypes.func.isRequired,
  onImportProject: PropTypes.func.isRequired,
  onExportProject: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  projectsList: state.Project.projectsList,
});

const mapDispatchToProps = dispatch => ({
  onOpenDevTools: () => dispatch(requestOpenDevTools()),
  onExportProject: projectId => dispatch(requestExportProject(projectId)),
  onImportProject: () => dispatch(requestImportProject()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeveloperMenu);
