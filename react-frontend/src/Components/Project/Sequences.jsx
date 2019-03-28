import React from 'react';
import {
  Container,
  Message,
  Accordion,
  Button,
} from 'semantic-ui-react';

import Sequence from './Sequence';

const sequencePanels = [
  {
    key: 'seq-0',
    title: 'Loop Sequence',
    content: {
      content: (
        <Sequence sequenceId={0} projectId={0} />
      ),
    },
  },
  {
    key: 'seq-1',
    title: 'Main Sequence',
    content: {
      content: (
        <Sequence sequenceId={1} projectId={0} />
      ),
    },
  },
];

const Sequences = () => (
  <Container>
    <Message content="The default template uses a Loop and a Main sequence. Each sequence represents a linear section of content and is usually produced in its own DAW session." />
    <Accordion panels={sequencePanels} defaultActiveIndex={1} />
  </Container>
);

export default Sequences;
