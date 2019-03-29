import React from 'react';
import { connect } from 'react-redux';
import {
  Form,
  Message,
} from 'semantic-ui-react';

import {
  getProjectSettings,
  setProjectSetting,
} from '../../actions/project';

class Advanced extends React.Component {
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
      joiningLink,
      cloudSyncHostname,
      loading,
    } = this.props;

    return (
      <Form loading={loading}>
        <Message content="These settings are only required for hosting the exported application on a public server. They are not used in the preview." />
        <Form.Input
          label="Short joining link"
          placeholder="https://example.com/#!/join"
          name="joiningLink"
          defaultValue={joiningLink}
          onBlur={this.handleBlur}
        />
        <Form.Input
          label="Cloud-Sync Service Hostname"
          placeholder="cloudsync.virt.ch.bbc.co.uk"
          name="cloudSyncHostname"
          defaultValue={cloudSyncHostname}
          onBlur={this.handleBlur}
        />
      </Form>
    );
  }
}

const mapStateToProps = (state) => {
  const loading = state.Project.settingsLoading;
  const {
    joiningLink,
    cloudSyncHostname,
  } = state.Project.settings;

  return {
    loading,
    joiningLink,
    cloudSyncHostname,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(key, value)),
  onGetProjectSettings: () => dispatch(getProjectSettings()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Advanced);
