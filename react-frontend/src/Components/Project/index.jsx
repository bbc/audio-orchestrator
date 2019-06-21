import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Menu,
  Tab,
} from 'semantic-ui-react';
import Sequences from './Sequences';
import Rules from './Rules';
import Presentation from './Presentation';
import Advanced from './Advanced';
import Review from './Review';
import EditableMenuHeader from './EditableMenuHeader';
import {
  closeProject,
  setProjectName,
} from '../../actions/project';
import {
  openProjectPage,
} from '../../actions/ui';
import {
  PAGE_PROJECT_SEQUENCES,
  PAGE_PROJECT_RULES,
  PAGE_PROJECT_PRESENTATION,
  PAGE_PROJECT_ADVANCED,
  PAGE_PROJECT_REVIEW,
} from '../../reducers/UIReducer';


const Project = ({
  projectId,
  onClose,
  onSetName,
  name,
  onOpenProjectPage,
  currentProjectPage,
}) => {
  // The page identifier is in this array to map between the page name and activeIndex.
  const tabPanes = [
    {
      page: PAGE_PROJECT_SEQUENCES,
      menuItem: 'Sequences',
      render: () => <Sequences projectId={projectId} />,
    },
    {
      page: PAGE_PROJECT_RULES,
      menuItem: 'Device Tags',
      render: () => <Rules projectId={projectId} />,
    },
    {
      page: PAGE_PROJECT_PRESENTATION,
      menuItem: 'Presentation',
      render: () => <Presentation projectId={projectId} />,
    },
    {
      page: PAGE_PROJECT_ADVANCED,
      menuItem: 'Advanced',
      render: () => <Advanced projectId={projectId} />,
    },
    {
      page: PAGE_PROJECT_REVIEW,
      menuItem: 'Preview and Export',
      render: () => <Review projectId={projectId} />,
    },
  ];

  return (
    <Container>
      <Menu inverted color="orange" attached="bottom">
        <EditableMenuHeader value={name} onChange={onSetName} />
        <Menu.Item position="right" icon="close" content="close" onClick={onClose} />
      </Menu>
      <Tab
        activeIndex={tabPanes.findIndex(({ page }) => page === currentProjectPage) || 0}
        panes={tabPanes}
        menu={{ secondary: false, pointing: true, color: 'orange' }}
        onTabChange={(e, { activeIndex }) => onOpenProjectPage(tabPanes[activeIndex].page)}
      />
    </Container>
  );
};

Project.propTypes = {
  projectId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  currentProjectPage: PropTypes.string.isRequired,
  onSetName: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpenProjectPage: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { projectId }) => ({
  name: state.Project.projects[projectId].name,
  currentProjectPage: state.UI.currentProjectPage,
});

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onClose: () => dispatch(closeProject(projectId)),
  onSetName: name => dispatch(setProjectName(projectId, name)),
  onOpenProjectPage: page => dispatch(openProjectPage(projectId, page)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Project);
