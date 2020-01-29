import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Form,
  Accordion,
} from 'semantic-ui-react';

import {
  setProjectSetting,
} from '../../../actions/project';

class AdvancedSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
    };

    this.handleBlur = this.handleBlur.bind(this);
    this.handleToggleActive = this.handleToggleActive.bind(this);
  }

  handleBlur(e) {
    const { onChangeSetting } = this.props;
    const { name, value } = e.target;

    onChangeSetting(name, value);
  }

  handleToggleActive() {
    const { active } = this.state;
    this.setState({ active: !active });
  }

  render() {
    const {
      joiningLink,
      cloudSyncHostname,
      cloudSyncPort,
      baseUrl,
    } = this.props;

    const {
      active,
    } = this.state;

    return (
      <Accordion>
        <Accordion.Title
          content="Advanced settings"
          active={active}
          onClick={this.handleToggleActive}
        />
        <Accordion.Content active={active}>
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
              label="Audio base URL (if audio files are served from a separate content delivery network)"
              placeholder="audio/"
              name="baseUrl"
              defaultValue={baseUrl}
              onBlur={this.handleBlur}
            />
          </Form>
        </Accordion.Content>
      </Accordion>
    );
  }
}

AdvancedSettings.propTypes = {
  onChangeSetting: PropTypes.func.isRequired,
  joiningLink: PropTypes.string,
  cloudSyncHostname: PropTypes.string,
  baseUrl: PropTypes.string,
  cloudSyncPort: PropTypes.string,
};

// TODO determine if these are sensible defaults, or if they could be made required.
AdvancedSettings.defaultProps = {
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

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings);
