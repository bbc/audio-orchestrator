import React from 'react';
import {
  Form,
  Message,
  Button,
} from 'semantic-ui-react';

const Advanced = () => (
  <Form>
    <Message>
      These settings are only required for hosting the exported application on a public server. They are not used in the preview.
    </Message>
    <Form.Input label="Short joining link" placeholder="https://example.com/#!/join" />
    <Form.Input label="Cloud-Sync Service Hostname" defaultValue="cloudsync.virt.ch.bbc.co.uk" />
    <Button type="reset" icon="undo" labelPosition="left" content="Reset" disabled />
  </Form>
);

export default Advanced;
