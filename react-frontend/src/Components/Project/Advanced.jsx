import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Form,
  Message,
} from 'semantic-ui-react';

import {
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

  render() {
    const {
      joiningLink,
      cloudSyncHostname,
      baseUrl,
    } = this.props;

    return (
      <Form>
        <Message icon="lightbulb outline" header="Advanced settings" content="These settings can usually be left at their default values. They may be needed for hosting the exported application on a public server." />
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
        <Form.Input
          label="Audio base URL"
          placeholder="audio/"
          name="baseUrl"
          defaultValue={baseUrl}
          onBlur={this.handleBlur}
        />
      </Form>
    );
  }
}

Advanced.propTypes = {
  onChangeSetting: PropTypes.func.isRequired,
  joiningLink: PropTypes.string,
  cloudSyncHostname: PropTypes.string,
  baseUrl: PropTypes.string,
};

const mapStateToProps = (state, { projectId }) => {
  const project = state.Project.projects[projectId];

  const {
    joiningLink,
    cloudSyncHostname,
    baseUrl,
  } = project.settings;

  return {
    joiningLink,
    cloudSyncHostname,
    baseUrl,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Advanced);
