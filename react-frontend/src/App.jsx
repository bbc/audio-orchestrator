import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader/root';

import {
  Message,
} from 'semantic-ui-react';

// Semantic-UI's theme CSS provides the styling of the page and has to be imported once.
import 'semantic-ui-css/semantic.min.css';

import {
  clearAppWarning,
} from './actions/ui';

import Project from './Components/Project';
import Home from './Components/Home';
import ErrorModal from './Components/ErrorModal';
import WarningModal from './Components/WarningModal';

const getCurrentPageComponent = (currentPage) => {
  switch (currentPage) {
    case 'home':
      return Home;
    case 'project':
      return Project;
    default:
      return (
        <Message error content={`invalid page ${currentPage}`} />
      );
  }
};

const App = ({
  currentPage,
  currentProjectId,
  onCloseWarning,
  error,
  errorLink,
  warning,
  warningLink,
}) => {
  const Page = getCurrentPageComponent(currentPage);
  return (
    <div>
      <Page projectId={currentProjectId} />
      <ErrorModal content={error} link={errorLink} />
      <WarningModal content={warning} link={warningLink} onClose={onCloseWarning} />
    </div>
  );
};

App.propTypes = {
  currentPage: PropTypes.string.isRequired,
  currentProjectId: PropTypes.string,
  onCloseWarning: PropTypes.func.isRequired,
  error: PropTypes.string,
  errorLink: PropTypes.string,
  warning: PropTypes.string,
  warningLink: PropTypes.string,
};

App.defaultProps = {
  currentProjectId: null,
  error: null,
  errorLink: null,
  warning: null,
  warningLink: null,
};

const mapStateToProps = ({ UI }) => ({
  currentPage: UI.currentPage,
  currentProjectId: UI.currentProjectId,
  error: UI.error,
  errorLink: UI.errorLink,
  warning: UI.warning,
  warningLink: UI.warningLink,
});

const mapDispatchToProps = dispatch => ({
  onCloseWarning: () => dispatch(clearAppWarning()),
});

export default hot(connect(mapStateToProps, mapDispatchToProps)(App));
