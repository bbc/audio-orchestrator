import React from 'react';
import { connect } from 'react-redux';
import {
  Form,
} from 'semantic-ui-react';

import {
  getProjectSettings,
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

  componentDidMount() {
    const { onGetProjectSettings } = this.props;
    onGetProjectSettings();
  }

  render() {
    const {
      title,
      startLabel,
      introduction,
      loading,
    } = this.props;

    return (
      <Form loading={loading}>
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
    );
  }
}

const mapStateToProps = (state) => {
  const loading = state.Project.settingsLoading;
  const {
    title,
    startLabel,
    introduction,
  } = state.Project.settings;

  return {
    loading,
    title,
    startLabel,
    introduction,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(key, value)),
  onGetProjectSettings: () => dispatch(getProjectSettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Presentation);
