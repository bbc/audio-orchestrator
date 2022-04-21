/* eslint-disable jsx-a11y/label-has-for, jsx-a11y/label-has-associated-control */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Form,
  Accordion,
  Button,
} from 'semantic-ui-react';

import ButtonGroupToggle from 'Components/Project/Controls/ButtonGroupToggle';
import {
  setProjectSetting,
  selectCustomTemplatePath,
} from '../../../actions/project';

const syncEndpointTypeValues = [
  {
    value: 'cloud-sync',
    displayName: 'Cloud-Sync',
  },
  {
    value: 'peerjs',
    displayName: 'PeerJS',
  },
];

class AdvancedSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleToggleActive = this.handleToggleActive.bind(this);
  }

  handleChange(e, data) {
    const { onChangeSetting } = this.props;
    let { name, value } = e.target;

    if (data) {
      ({ name, value } = data);
    }

    onChangeSetting(name, value);
  }

  handleToggleActive() {
    const { active } = this.state;
    this.setState({ active: !active });
  }

  render() {
    const {
      joiningLink,
      syncEndpointType,
      cloudSyncHostname,
      cloudSyncPort,
      baseUrl,
      customTemplatePath,
      onSelectCustomTemplatePath,
      onChangeSetting,
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
              placeholder=""
              name="joiningLink"
              defaultValue={joiningLink}
              onBlur={this.handleChange}
            />

            <Form.Field>
              <label>Synchronisation service</label>

              <ButtonGroupToggle
                name="syncEndpointType"
                allowedValues={syncEndpointTypeValues}
                value={syncEndpointType}
                onChange={this.handleChange}
              />
            </Form.Field>

            <Form.Group>
              <Form.Input
                label="Custom Cloud-Sync service hostname"
                placeholder=""
                name="cloudSyncHostname"
                defaultValue={cloudSyncHostname}
                onBlur={this.handleChange}
                error={!cloudSyncHostname}
                disabled={syncEndpointType !== 'cloud-sync'}
              />
              <Form.Input
                label="Port number (leave empty to use the default wss:// connection)"
                placeholder="default"
                name="cloudSyncPort"
                defaultValue={cloudSyncPort}
                onBlur={this.handleChange}
                disabled={syncEndpointType !== 'cloud-sync'}
              />
            </Form.Group>

            <Form.Input
              label="Audio base URL (if audio files are served from a separate content delivery network)"
              placeholder="audio"
              name="baseUrl"
              defaultValue={baseUrl}
              onBlur={this.handleChange}
            />
            <Form.Input
              label="Custom template path"
              readOnly
              name={customTemplatePath}
              defaultValue={customTemplatePath}
              onClick={onSelectCustomTemplatePath}
              action={{
                icon: 'open folder',
                primary: true,
                labelPosition: 'left',
                content: 'Browse',
                onClick: onSelectCustomTemplatePath,
              }}
            />
            { customTemplatePath && (
              <Form.Field>
                <Button
                  primary
                  icon="undo"
                  content="Reset to built-in template"
                  labelPosition="left"
                  onClick={() => onChangeSetting('customTemplatePath', undefined)}
                />
              </Form.Field>
            )}
          </Form>
        </Accordion.Content>
      </Accordion>
    );
  }
}

AdvancedSettings.propTypes = {
  onChangeSetting: PropTypes.func.isRequired,
  onSelectCustomTemplatePath: PropTypes.func.isRequired,
  joiningLink: PropTypes.string,
  cloudSyncHostname: PropTypes.string,
  baseUrl: PropTypes.string,
  syncEndpointType: PropTypes.string.isRequired,
  cloudSyncPort: PropTypes.string,
  customTemplatePath: PropTypes.string,
};

// TODO determine if these are sensible defaults, or if they could be made required.
AdvancedSettings.defaultProps = {
  joiningLink: undefined,
  cloudSyncHostname: undefined,
  baseUrl: undefined,
  cloudSyncPort: undefined,
  customTemplatePath: undefined,
};

const mapStateToProps = (state, { projectId }) => {
  const project = state.Project.projects[projectId];

  const {
    joiningLink,
    syncEndpointType,
    cloudSyncHostname,
    cloudSyncPort,
    baseUrl,
    customTemplatePath,
  } = project.settings;

  return {
    joiningLink,
    syncEndpointType,
    cloudSyncHostname,
    cloudSyncPort,
    baseUrl,
    customTemplatePath,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
  onSelectCustomTemplatePath: () => dispatch(selectCustomTemplatePath(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings);
