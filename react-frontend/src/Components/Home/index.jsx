/* global VERSION */
import React from 'react';
import PropTypes from 'prop-types';
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
} from 'semantic-ui-react';
import ProjectsList from './ProjectsList';
import DeveloperMenu from './DeveloperMenu';

import {
  requestListProjects,
  checkFileOpen,
  requestCreateProject,
  requestOpenProject,
} from '../../actions/project';

import {
  requestCheckRequirements,
} from '../../actions/requirements';

class Home extends React.Component {
  // TODO Do we need to request loading things from within the component?
  componentDidMount() {
    const {
      onRequestCheckRequirements,
      onRequestListProjects,
      onCheckFileOpen,
    } = this.props;
    onRequestCheckRequirements();
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
    } = this.props;

    return (
      <Container>
        <Menu inverted color="blue" attached="bottom">
          <Menu.Item header>Home</Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item content={`Orchestrator ${VERSION}`} />
            <Menu.Item icon="info" onClick={window.openCredits} />
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

Home.propTypes = {
  onRequestCheckRequirements: PropTypes.func.isRequired,
  onRequestListProjects: PropTypes.func.isRequired,
  onCheckFileOpen: PropTypes.func.isRequired,
  onOpenProject: PropTypes.func.isRequired,
  onCreateProject: PropTypes.func.isRequired,
  allowFileOpen: PropTypes.bool.isRequired,
  projectsList: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  projectsListLoading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  allowFileOpen: state.Project.allowFileOpen,
  projectsListLoading: state.Project.projectsListLoading,
  projectsList: state.Project.projectsList,
});

const mapDispatchToProps = dispatch => ({
  onOpenProject: () => dispatch(requestOpenProject()),
  // TODO actually, open a modal to enter a name first?
  onCreateProject: () => dispatch(requestCreateProject()),
  onRequestListProjects: () => dispatch(requestListProjects()),
  onCheckFileOpen: () => dispatch(checkFileOpen()),
  onRequestCheckRequirements: () => dispatch(requestCheckRequirements()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
