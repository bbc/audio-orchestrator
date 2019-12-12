import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
} from 'semantic-ui-react';

const Controls = ({
  projectId,
}) => (
  <Container>
    <h1>Controls</h1>
    <h2>{projectId}</h2>
  </Container>
);

Controls.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default Controls;
