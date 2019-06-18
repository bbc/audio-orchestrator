import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Modal,
  Header,
  Button,
  Grid,
  Icon,
} from 'semantic-ui-react';

import {
  requestExportAudio,
  requestExportTemplate,
  requestExportDistribution,
} from '../../../actions/export';

class ExportTypeSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = { open: false };
    this.handleOpen = () => this.setState({ open: true });
    this.handleClose = () => this.setState({ open: false });
  }

  render() {
    const { open } = this.state;
    const {
      projectId,
      onExportAudio,
      onExportTemplate,
      onExportDistribution,
      disabled,
    } = this.props;

    return (
      <Modal
        trigger={(
          <Button
            primary
            content="Export"
            labelPosition="right"
            icon="share"
            onClick={this.handleOpen}
            disabled={disabled}
          />
        )}
        open={open}
        onClose={this.handleClose}
        centered={false}
        size="large"
      >
        <Modal.Header content="Select export type" />
        <Modal.Content>
          <Grid columns={3} divided padded textAlign="center">
            <Grid.Column>
              <Header icon>
                <Icon name="file audio outline" />
                Audio only
                <Header.Subheader content="Save the encoded sequence audio and metadata files to drop into an existing application." />
              </Header>
              <Button
                content="Export audio only"
                onClick={() => { onExportAudio(projectId); this.handleClose(); }}
                primary
                icon="download"
                labelPosition="left"
              />
            </Grid.Column>
            <Grid.Column>
              <Header icon>
                <Icon name="file code outline" />
                Template code
                <Header.Subheader content="Save a template source code folder including the audio as a starting point for a custom design." />
              </Header>
              <Button
                content="Export template code"
                onClick={() => { onExportTemplate(projectId); this.handleClose(); }}
                primary
                icon="download"
                labelPosition="left"
              />
            </Grid.Column>
            <Grid.Column>
              <Header icon>
                <Icon name="file archive outline" />
                Ready-built distribution
                <Header.Subheader content="Save the compiled template code the template code and audio as a distribution ready to publish." />
              </Header>
              <Button
                content="Export distribution"
                onClick={() => { onExportDistribution(projectId); this.handleClose(); }}
                primary
                icon="download"
                labelPosition="left"
              />
            </Grid.Column>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Cancel" onClick={this.handleClose} />
        </Modal.Actions>
      </Modal>
    );
  }
}

ExportTypeSelection.propTypes = {
  projectId: PropTypes.string.isRequired,
  onExportAudio: PropTypes.func.isRequired,
  onExportTemplate: PropTypes.func.isRequired,
  onExportDistribution: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ExportTypeSelection.defaultProps = {
  disabled: false,
};

const mapStateToProps = () => ({ });

const mapDispatchToProps = dispatch => ({
  onExportAudio: projectId => dispatch(requestExportAudio(projectId)),
  onExportTemplate: projectId => dispatch(requestExportTemplate(projectId)),
  onExportDistribution: projectId => dispatch(requestExportDistribution(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportTypeSelection);
