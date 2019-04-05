import React from 'react';
import PropTypes from 'prop-types';
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
        <Message icon="lightbulb outline" header="Advanced technical details" content="These settings are only required for hosting the exported application on a public server. They are not used in the preview and can be easily changed by a developer later." onDismiss={() => {}} />
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

Advanced.propTypes = {
  onChangeSetting: PropTypes.func.isRequired,
  onGetProjectSettings: PropTypes.func.isRequired,
  joiningLink: PropTypes.string,
  cloudSyncHostname: PropTypes.string,
  loading: PropTypes.string,
};

const mapStateToProps = (state, { projectId }) => {
  const project = state.Project.projects[projectId];

  const loading = state.settingsLoading;

  const {
    joiningLink,
    cloudSyncHostname,
  } = project.settings;

  return {
    loading,
    joiningLink,
    cloudSyncHostname,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
  onGetProjectSettings: () => dispatch(getProjectSettings(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Advanced);
