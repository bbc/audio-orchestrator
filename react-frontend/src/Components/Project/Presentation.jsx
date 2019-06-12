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

const colourOptions = [
  { key: '#33ccff', value: '#33ccff', text: 'blue' },
  { key: '#33ffcc', value: '#33ffcc', text: 'turquoise' },
  { key: '#cc33ff', value: '#cc33ff', text: 'purple' },
  { key: '#ccff33', value: '#ccff33', text: 'olive' },
  { key: '#ff33cc', value: '#ff33cc', text: 'pink' },
  { key: '#ffcc33', value: '#ffcc33', text: 'yellow' },
];

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
      accentColour,
      onChangeSetting,
    } = this.props;

    return (
      <Container>
        <Message icon="lightbulb outline" header="Presentation settings" content="These labels are used in the preview and the prototype interface. They can be easily changed when adapting the prototype for a specific design." />
        <Form>
          <Form.Input
            label="Title"
            placeholder="Give your experience a name..."
            name="title"
            defaultValue={title}
            onBlur={this.handleBlur}
          />
          <Form.Input
            label="Start button label"
            placeholder="Click this to start a new session..."
            name="startLabel"
            defaultValue={startLabel}
            onBlur={this.handleBlur}
          />
          <Form.Input
            label="Introduction"
            placeholder="Introduce your project..."
            name="introduction"
            defaultValue={introduction}
            onBlur={this.handleBlur}
          />
          <Form.Select
            label="Accent colour"
            name="accentColour"
            value={accentColour}
            onChange={(e, d) => onChangeSetting('accentColour', d.value)}
            options={colourOptions}
            style={{ backgroundColor: accentColour }}
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
  accentColour: PropTypes.string,
  onChangeSetting: PropTypes.func.isRequired,
};

Presentation.defaultProps = {
  title: '',
  startLabel: '',
  introduction: '',
  accentColour: '#33ccff',
};

const mapStateToProps = (state, { projectId }) => {
  const project = state.Project.projects[projectId];

  const { settings } = project;

  const {
    title,
    startLabel,
    introduction,
    accentColour,
  } = settings;

  return {
    title,
    startLabel,
    introduction,
    accentColour,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Presentation);
