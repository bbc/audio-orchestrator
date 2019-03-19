import React from 'react';
import { hot } from 'react-hot-loader/root';

import { Container, Message } from 'semantic-ui-react';

// Semantic-UI's theme CSS provides the styling of the page and has to be imported once.
import 'semantic-ui-css/semantic.min.css';

const App = () => (
  <Container>
    <Message
      header="Hello, World"
      content="This is an example for the Semantic-UI React integration. If you can read this, the build process is working."
    />
  </Container>
);

export default hot(App);
