import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Form,
  Header,
  Button,
  Card,
  Segment,
} from 'semantic-ui-react';
import {
  setProjectSetting,
  requestReplaceProjectPlayerImage,
} from '#Actions/project.js';
import PageTitleBar from '../../PageTitleBar.jsx';
import ImagePreview from '../../ImagePreview.jsx';
import ColorSelection from './ColorSelection.jsx';

const colors = [
  '#006def',
  '#450073',
  '#ff4855',
  '#d64bce',
  '#730a40',
  '#ff5b00',
  '#ffbb00',
  '#342446',
  '#12a87a',
  '#66cfa3',
  '#000050',
  '#7080ff',
  '#80bbff',
];

class Appearance extends React.Component {
  constructor(props) {
    super(props);

    this.handleBlur = (e) => {
      const { onChangeSetting } = this.props;
      const { name, value, type } = e.target;

      if (type === 'number') {
        onChangeSetting(name, parseFloat(value));
      } else {
        onChangeSetting(name, value);
      }
    };

    this.handleChange = (e, data) => {
      const { onChangeSetting } = this.props;
      const {
        name,
        type,
        value,
        checked,
      } = data;

      if (type === 'checkbox') {
        onChangeSetting(name, checked);
      } else {
        onChangeSetting(name, value);
      }
    };
  }

  render() {
    const {
      projectId,
      title,
      subtitle,
      startLabel,
      joinLabel,
      introduction,
      enableDebugUI,
      enableCalibration,
      enablePlayPauseOnAux,
      accentColour,
      compressorRatio,
      compressorThreshold,
      fadeOutDuration,
      playerImageId,
      playerImageAltText,
      onReplaceCoverImage,
    } = this.props;

    // onChange={(e, d) => onChangeSetting('accentColour', d.value)}

    return (
      <Container>
        <Form>
          <PageTitleBar
            title="Appearance"
            shortDescription="Use the appearance settings to customise the look and feel of the prototype application that the listener will see."
            helpId="presentation"
          />
          <Header content="Text" subheader="This text will appear at various places in the prototype application." />
          <Form.Group widths="equal">
            <Form.Input
              label="Title"
              placeholder=""
              name="title"
              defaultValue={title}
              onBlur={this.handleBlur}
            />
            <Form.Input
              label="Subtitle"
              placeholder=""
              name="subtitle"
              defaultValue={subtitle}
              onBlur={this.handleBlur}
            />
            <Form.Input
              label="Introduction"
              placeholder=""
              name="introduction"
              defaultValue={introduction}
              onBlur={this.handleBlur}
            />
          </Form.Group>
          <Form.Group widths="equal">
            <Form.Input
              label="Start button label"
              placeholder=""
              name="startLabel"
              defaultValue={startLabel}
              onBlur={this.handleBlur}
            />
            <Form.Input
              label="Join button label"
              placeholder=""
              name="joinLabel"
              defaultValue={joinLabel}
              onBlur={this.handleBlur}
            />
          </Form.Group>

          <Header
            content="Accent colour"
            subheader="The accent colour is used as the background for any buttons and the play bar."
          />

          <Segment>
            <ColorSelection colors={colors} custom name="accentColour" value={accentColour} onChange={this.handleChange} />
          </Segment>

          <Header content="Cover image" subheader="The cover artwork should be a square image (recommended size 600 x 600 pixels)." />

          <Card>
            { playerImageId
              ? <ImagePreview projectId={projectId} imageId={playerImageId} />
              : <Card.Content content="No image selected." />}

            { playerImageId && (
              <Card.Content extra>
                <Form.Input
                  label="Image alt text"
                  placeholder=""
                  name="playerImageAltText"
                  defaultValue={playerImageAltText}
                  onBlur={this.handleBlur}
                />
              </Card.Content>
            )}

            <Card.Content extra textAlign="center">
              <Button
                primary
                labelPosition="left"
                icon={playerImageId ? 'refresh' : 'plus'}
                content={`${playerImageId ? 'Replace' : 'Add'} cover image`}
                onClick={onReplaceCoverImage}
              />
            </Card.Content>
          </Card>

          <Header content="Interface options" />
          <Form.Checkbox
            label="Display list of active audio objects"
            name="enableDebugUI"
            defaultChecked={enableDebugUI}
            onChange={this.handleChange}
          />

          <Form.Checkbox
            label="Enable calibration"
            name="enableCalibration"
            defaultChecked={enableCalibration}
            onChange={this.handleChange}
          />

          <Form.Checkbox
            label="Show Play and Pause buttons on aux devices"
            name="enablePlayPauseOnAux"
            defaultChecked={enablePlayPauseOnAux}
            onChange={this.handleChange}
          />

          <Header content="Audio compression" subheader="Audio compression is applied to the output of aux devices (set the threshold to 0 to disable compression)." />
          <Form.Group widths="3">
            <Form.Input
              label="Compressor ratio"
              placeholder="Set the ratio (between 1 and 20)"
              type="number"
              min="1"
              max="20"
              name="compressorRatio"
              defaultValue={compressorRatio}
              onBlur={this.handleBlur}
            />
            <Form.Input
              label="Compressor threshold (dB)"
              placeholder="Set the threshold (between -100 dB and 0 dB)"
              type="number"
              min="-100"
              max="0"
              name="compressorThreshold"
              defaultValue={compressorThreshold}
              onBlur={this.handleBlur}
            />
          </Form.Group>

          <Header content="Object fade out" subheader="Set the duration of the fade out that is applied when an object is no longer allocated to a device." />
          <Form.Group widths="3">
            <Form.Input
              label="Fade duration (seconds)"
              placeholder="Set the fade duration (between 0.0 and 5.0 seconds)"
              type="number"
              min="0.0"
              max="5.0"
              step="0.1"
              name="fadeOutDuration"
              defaultValue={fadeOutDuration}
              onBlur={this.handleBlur}
            />
          </Form.Group>
        </Form>
      </Container>
    );
  }
}

Appearance.propTypes = {
  projectId: PropTypes.string.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  startLabel: PropTypes.string,
  joinLabel: PropTypes.string,
  introduction: PropTypes.string,
  enableDebugUI: PropTypes.bool,
  enableCalibration: PropTypes.bool,
  enablePlayPauseOnAux: PropTypes.bool,
  compressorRatio: PropTypes.number,
  compressorThreshold: PropTypes.number,
  fadeOutDuration: PropTypes.number,
  accentColour: PropTypes.string,
  playerImageId: PropTypes.string,
  playerImageAltText: PropTypes.string,
  onChangeSetting: PropTypes.func.isRequired,
  onReplaceCoverImage: PropTypes.func.isRequired,
};

Appearance.defaultProps = {
  title: undefined,
  subtitle: undefined,
  startLabel: undefined,
  joinLabel: undefined,
  introduction: undefined,
  enableDebugUI: undefined,
  enableCalibration: undefined,
  enablePlayPauseOnAux: undefined,
  compressorRatio: undefined,
  compressorThreshold: undefined,
  fadeOutDuration: undefined,
  accentColour: undefined,
  playerImageId: undefined,
  playerImageAltText: undefined,
};

const mapStateToProps = (state, { projectId }) => {
  const project = state.Project.projects[projectId];

  const { settings } = project;

  const {
    title,
    subtitle,
    startLabel,
    joinLabel,
    introduction,
    accentColour,
    enableDebugUI,
    enableCalibration,
    enablePlayPauseOnAux,
    compressorRatio,
    compressorThreshold,
    fadeOutDuration,
    playerImageId,
    playerImageAltText,
  } = settings;

  return {
    title,
    subtitle,
    startLabel,
    joinLabel,
    introduction,
    accentColour,
    enableDebugUI,
    enableCalibration,
    compressorRatio,
    compressorThreshold,
    fadeOutDuration,
    playerImageId,
    playerImageAltText,
    enablePlayPauseOnAux,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
  onReplaceCoverImage: () => dispatch(requestReplaceProjectPlayerImage(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Appearance);
