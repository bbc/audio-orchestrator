import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Message,
  Form,
} from 'semantic-ui-react';

import {
  setProjectSetting,
} from '../../actions/project';

class Presentation extends React.Component {
  constructor(props) {
    super(props);

    this.handleBlur = (e) => {
      const { onChangeSetting } = props;
      const { name, value } = e.target;

      onChangeSetting(name, value);
    };
  }

  render() {
    const {
      title,
      startLabel,
      introduction,
    } = this.props;

    return (
      <Container>
        <Message icon="lightbulb outline" header="Presentation settings" content="These labels are used in the preview and the prototype interface. They can be easily changed when adapting the prototype for a specific design." />
        <Form>
          <Form.Input
            label="Title"
            name="title"
            defaultValue={title}
            onBlur={this.handleBlur}
          />
          <Form.Input
            label="Start button label"
            name="startLabel"
            defaultValue={startLabel}
            onBlur={this.handleBlur}
          />
          <Form.TextArea
            label="Introduction"
            name="introduction"
            defaultValue={introduction}
            onBlur={this.handleBlur}
          />
        </Form>
      </Container>
    );
  }
}

Presentation.propTypes = {
  title: PropTypes.string,
  startLabel: PropTypes.string,
  introduction: PropTypes.string,
  onChangeSetting: PropTypes.func.isRequired,
};

Presentation.defaultProps = {
  title: '',
  startLabel: '',
  introduction: '',
};

const mapStateToProps = (state, { projectId }) => {
  const project = state.Project.projects[projectId];

  const {
    title,
    startLabel,
    introduction,
  } = project.settings;

  return {
    title,
    startLabel,
    introduction,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Presentation);
