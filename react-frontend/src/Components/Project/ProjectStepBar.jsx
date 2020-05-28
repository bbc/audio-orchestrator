import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Step,
} from 'semantic-ui-react';

import {
  openProjectPage,
} from '../../actions/ui';

import {
  PAGE_PROJECT_SEQUENCES,
  PAGE_PROJECT_CONTROLS,
  PAGE_PROJECT_OBJECTS,
  PAGE_PROJECT_PRESENTATION,
  PAGE_PROJECT_EXPORT,
} from '../../reducers/UIReducer';

const steps = [
  {
    key: PAGE_PROJECT_SEQUENCES,
    icon: 'code branch',
    title: 'Sequences',
    // description: 'Define the flow through your experience',
  },
  {
    key: PAGE_PROJECT_CONTROLS,
    icon: 'tasks',
    title: 'Controls',
    // description: 'Define how users can influence the experience',
  },
  {
    key: PAGE_PROJECT_OBJECTS,
    icon: 'file audio outline',
    title: 'Audio',
    // description: 'Import audio and define where objects are rendered',
  },
  {
    key: PAGE_PROJECT_PRESENTATION,
    icon: 'paint brush',
    title: 'Appearance',
    // description: 'Define a colour scheme and images',
  },
  {
    key: PAGE_PROJECT_EXPORT,
    icon: 'share',
    title: 'Export',
  },
];

const ProjectStepBar = ({
  currentProjectPage,
  projectId,
  setCurrentPage,
}) => (
  <Step.Group
    fluid
    attached="bottom"
    widths={steps.length}
    items={steps.map(s => ({
      ...s,
      onClick: () => setCurrentPage(projectId, s.key),
      active: s.key === currentProjectPage,
    }))}
  />
);

ProjectStepBar.propTypes = {
  projectId: PropTypes.string.isRequired,
  currentProjectPage: PropTypes.string.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { UI } = state;
  const { currentProjectPage } = UI;

  return {
    currentProjectPage,
  };
};

const mapDispatchToProps = dispatch => ({
  setCurrentPage: (projectId, page) => dispatch(openProjectPage(projectId, page)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectStepBar);
