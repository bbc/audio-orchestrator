import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { hot } from 'react-hot-loader/root';

import {
  Message,
} from 'semantic-ui-react';

// Semantic-UI's theme CSS provides the styling of the page and has to be imported once.
import 'semantic-ui-css/semantic.min.css';

import Demo from './Components/DemoPage';
import Project from './Components/Project';
import Home from './Components/Home';

const getCurrentPageComponent = (currentPage) => {
  switch (currentPage) {
    case 'demo':
      return Demo;
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

const App = ({ currentPage }) => {
  const Page = getCurrentPageComponent(currentPage);
  return (
    <Page />
  );
};

App.propTypes = {
  currentPage: PropTypes.string.isRequired,
};

const mapStateToProps = ({ UI }) => ({
  currentPage: UI.currentPage,
});

export default hot(connect(mapStateToProps)(App));
