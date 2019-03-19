// React, to be able to use JSX syntax
import React from 'react';

// React-DOM to render React components in a web browser
import { render } from 'react-dom';

// App exports the top-level React component for this application, ready for hot reloading.
import App from './App';

// Render the App component to the top-level div on the page, after enabling hot-reloading for it.
/* eslint-disable react/jsx-filename-extension */
render(<App />, document.getElementById('app'));
