import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Form,
  Message,
  Container,
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
      cloudSyncPort,
      baseUrl,
    } = this.props;

    return (
      <Container>
        <Message icon="lightbulb outline" header="Advanced settings" content="These settings can usually be left at their default values. They may be needed for hosting the exported application on a public server." />
        <Form>
          <Form.Input
            label="Short joining link"
            placeholder="https://example.com/#!/join"
            name="joiningLink"
            defaultValue={joiningLink}
            onBlur={this.handleBlur}
          />
          <Form.Input
            label="Custom cloud-sync service hostname"
            placeholder="cloudsync.virt.ch.bbc.co.uk"
            name="cloudSyncHostname"
            defaultValue={cloudSyncHostname}
            onBlur={this.handleBlur}
          />
          <Form.Input
            label="Port number (for custom cloud-sync endpoint, leave empty to use the default wss:// connection)"
            placeholder="default"
            name="cloudSyncPort"
            defaultValue={cloudSyncPort}
            onBlur={this.handleBlur}
            disabled={!cloudSyncHostname}
          />
          <Form.Input
            label="Audio base URL"
            placeholder="audio/"
            name="baseUrl"
            defaultValue={baseUrl}
            onBlur={this.handleBlur}
          />
        </Form>
      </Container>
    );
  }
}

Advanced.propTypes = {
  onChangeSetting: PropTypes.func.isRequired,
  joiningLink: PropTypes.string,
  cloudSyncHostname: PropTypes.string,
  baseUrl: PropTypes.string,
  cloudSyncPort: PropTypes.string,
};

// TODO determine if these are sensible defaults, or if they could be made required.
Advanced.defaultProps = {
  joiningLink: undefined,
  cloudSyncHostname: undefined,
  baseUrl: undefined,
  cloudSyncPort: undefined,
};

const mapStateToProps = (state, { projectId }) => {
  const project = state.Project.projects[projectId];

  const {
    joiningLink,
    cloudSyncHostname,
    cloudSyncPort,
    baseUrl,
  } = project.settings;

  return {
    joiningLink,
    cloudSyncHostname,
    cloudSyncPort,
    baseUrl,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Advanced);
