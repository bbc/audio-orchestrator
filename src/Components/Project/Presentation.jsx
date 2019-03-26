import React from 'react';
import {
  Form,
} from 'semantic-ui-react';

const Presentation = () => (
  <Form>
    <Form.Input label="Title" defaultValue="My first project" />
    <Form.Input label="Start button label" defaultValue="Start" />
    <Form.TextArea label="Introduction" />
  </Form>
);

export default Presentation;
