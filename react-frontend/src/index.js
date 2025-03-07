// React, to be able to use JSX syntax
import React from 'react';

// Redux Provider, making the Redux store available to the rest of the app
import { Provider } from 'react-redux';

// React-DOM to render React components in a web browser
import { render } from 'react-dom';

// App exports the top-level React component for this application, ready for hot reloading.
import App from './App.jsx';

// The Redux store, configured in a separate file
import store from './store.js';

// Render the App component to the top-level div on the page, after enabling hot-reloading for it.
/* eslint-disable react/jsx-filename-extension */
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app'),
);
