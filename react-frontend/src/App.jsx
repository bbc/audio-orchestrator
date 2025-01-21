import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Message,
} from 'semantic-ui-react';

// Semantic-UI's theme CSS provides the styling of the page and has to be imported once.
import 'semantic-ui-css/semantic.min.css';

// styles overriding some semantic-ui styles
import './main.css';

import Project from '#Components/Project/index.jsx';
import Home from '#Components/Home/index.jsx';
import {
  clearAppWarning,
} from '#Actions/ui.js';
import ErrorModal from '#Components/ErrorModal.jsx';
import WarningModal from '#Components/WarningModal.jsx';

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

function App({
  currentPage,
  currentProjectId,
  onCloseWarning,
  error,
  errorLink,
  warning,
  warningLink,
}) {
  const Page = getCurrentPageComponent(currentPage);
  return (
    <div>
      <Page projectId={currentProjectId} />
      <ErrorModal content={error} link={errorLink} />
      <WarningModal content={warning} link={warningLink} onClose={onCloseWarning} />
    </div>
  );
}

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

const mapDispatchToProps = (dispatch) => ({
  onCloseWarning: () => dispatch(clearAppWarning()),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
