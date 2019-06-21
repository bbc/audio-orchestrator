/* global VERSION */
import React from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Menu,
  Segment,
  Grid,
  Divider,
  Header,
  Icon,
  Button,
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import ProjectsList from './ProjectsList';
import DeveloperMenu from './DeveloperMenu';

import {
  requestCreateProject,
  requestOpenProject,
  requestListProjects,
  checkFileOpen,
} from '../../actions/project';

class Home extends React.Component {
  componentDidMount() {
    const {
      onRequestListProjects,
      onCheckFileOpen,
    } = this.props;
    onRequestListProjects();
    onCheckFileOpen();
  }

  render() {
    const {
      onOpenProject,
      onCreateProject,
      allowFileOpen,
      projectsList,
      projectsListLoading,
      projectLoading,
    } = this.props;

    return (
      <Container>
        <Dimmer inverted active={projectLoading}>
          <Loader />
        </Dimmer>

        <Menu inverted color="blue" attached="bottom">
          <Menu.Item header>Home</Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item content={`Orchestration Builder ${VERSION}`} />
            <DeveloperMenu />
          </Menu.Menu>
        </Menu>

        <Segment placeholder>
          { allowFileOpen
            ? <Divider vertical content="or" />
            : null
          }
          <Grid columns={2} textAlign="center">
            { allowFileOpen
              ? (
                <Grid.Column>
                  <Header icon>
                    <Icon name="folder open outline" />
                    Load a previous project
                  </Header>
                  <Button primary content="Open" labelPosition="left" icon="folder open outline" onClick={onOpenProject} />
                </Grid.Column>
              )
              : null
            }
            <Grid.Column>
              <Header icon>
                <Icon name="file outline" />
                Start a new project
                <Header.Subheader>
                  A project describes an orchestrated audio prototype with one or more sequences.
                </Header.Subheader>
              </Header>
              <Button primary content="Create" labelPosition="left" icon="plus" onClick={onCreateProject} />
            </Grid.Column>
          </Grid>
        </Segment>
        <ProjectsList projects={projectsList} loading={projectsListLoading} />
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  allowFileOpen: state.Project.allowFileOpen,
  projectsListLoading: state.Project.projectsListLoading,
  projectsList: state.Project.projectsList,
  projectLoading: state.Project.loading,
});

const mapDispatchToProps = dispatch => ({
  onOpenProject: () => dispatch(requestOpenProject()),
  onCreateProject: () => dispatch(requestCreateProject()), // TODO actually, open a modal to enter a name first?
  onRequestListProjects: () => dispatch(requestListProjects()),
  onCheckFileOpen: () => dispatch(checkFileOpen()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
