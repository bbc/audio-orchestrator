import React from 'react';
import { hot } from 'react-hot-loader/root';

import { Container, Message } from 'semantic-ui-react';

const App = () => (
  <Container>
    <Message
      header="Hello, World"
      content="This is an example for the Semantic-UI React integration. If you can read this, the build process is working."
    />
  </Container>
);

export default hot(App);
