import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Message,
  Button,
} from 'semantic-ui-react';

const Demo = ({
  demo,
  toggleDemo,
}) => (
  <Container>
    <Message color={demo ? 'blue' : 'grey'}>
      <Button
        onClick={toggleDemo}
        content="Toggle"
        labelPosition="right"
        primary
        label={{
          basic: true,
          pointing: 'left',
          content: (demo ? 'Blue' : 'Grey'),
        }}
      />
    </Message>
  </Container>
);

Demo.propTypes = {
  demo: PropTypes.bool.isRequired,
  toggleDemo: PropTypes.func.isRequired,
};

const mapStateToProps = ({ demo }) => ({
  demo,
});

const mapDispatchToProps = dispatch => ({
  toggleDemo: () => {
    console.log('click');
    dispatch({ type: 'DEMO' });
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Demo);
