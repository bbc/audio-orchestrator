import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Form,
  Header,
  Button,
  Card,
} from 'semantic-ui-react';
import PageTitleBar from '../../PageTitleBar';
import ImagePreview from '../../ImagePreview';
import ColorSelection from './ColorSelection';

import {
  setProjectSetting,
  requestReplaceProjectPlayerImage,
} from '../../../actions/project';

const colors = [
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

class Presentation extends React.Component {
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
      enableTutorial,
      accentColour,
      compressorRatio,
      compressorThreshold,
      playerImageId,
      onReplaceCoverImage,
    } = this.props;

    // onChange={(e, d) => onChangeSetting('accentColour', d.value)}

    return (
      <Container>
        <Form>
          <PageTitleBar
            title="Look & Feel"
            shortDescription="The presentation settings customise the look and feel of the preview and exported prototype application."
            helpId="presentation"
          />
          <Header content="Title text" subheader="This text will appear on the front page of the experience." />
          <Form.Group widths="equal">
            <Form.Input
              label="Title"
              placeholder="Main title"
              name="title"
              defaultValue={title}
              onBlur={this.handleBlur}
            />
            <Form.Input
              label="Subtitle"
              placeholder="Secondary title"
              name="subtitle"
              defaultValue={subtitle}
              onBlur={this.handleBlur}
            />
            <Form.Input
              label="Introduction"
              placeholder="Introduction"
              name="introduction"
              defaultValue={introduction}
              onBlur={this.handleBlur}
            />
          </Form.Group>

          <Header content="Button labels" subheader="These labels will appear on the start and join buttons on the home page." />
          <Form.Group widths="equal">
            <Form.Input
              label="Start button"
              placeholder="Start"
              name="startLabel"
              defaultValue={startLabel}
              onBlur={this.handleBlur}
            />
            <Form.Input
              label="Join button"
              placeholder="Join"
              name="joinLabel"
              defaultValue={joinLabel}
              onBlur={this.handleBlur}
            />
          </Form.Group>

          <Header content="Colours" subheader="The accent colour is used as the background for any buttons, the default cover image, and the play bar." />

          <ColorSelection colors={colors} custom name="accentColour" value={accentColour} onChange={this.handleChange} />

          <Header content="Cover image" subheader="The cover artwork should be a square image (recommended size 600 x 600 pixels)." />

          <Card>
            { playerImageId
              ? <ImagePreview projectId={projectId} imageId={playerImageId} />
              : <Card.Content content="No image selected." />
            }

            <Card.Content extra textAlign="center">
              <Button
                primary
                icon="linkify"
                content={`${playerImageId ? 'Replace' : 'Add'} cover image`}
                onClick={onReplaceCoverImage}
              />
            </Card.Content>
          </Card>

          <Header content="Interface options" />
          <Form.Checkbox
            label="Enable tutorial screen"
            name="enableTutorial"
            defaultChecked={enableTutorial}
            onChange={this.handleChange}
          />
          <Form.Checkbox
            label="Display list of active audio objects"
            name="enableDebugUI"
            defaultChecked={enableDebugUI}
            onChange={this.handleChange}
          />

          <Header content="Audio compression" subheader="Audio compression is applied to the output of auxiliary devices (set the threshold to 0 to disable compression)." />
          <Form.Group widths="equal">
            <Form.Input
              label="Compressor ratio"
              placeholder="Ratio (between 1 and 20)"
              type="number"
              min="1"
              max="20"
              name="compressorRatio"
              defaultValue={compressorRatio}
              onBlur={this.handleBlur}
            />
            <Form.Input
              label="Compressor threshold in dB"
              placeholder="Threshold (between -100 and 0)"
              type="number"
              min="-100"
              max="0"
              name="compressorThreshold"
              defaultValue={compressorThreshold}
              onBlur={this.handleBlur}
            />
          </Form.Group>
        </Form>
      </Container>
    );
  }
}

Presentation.propTypes = {
  projectId: PropTypes.string.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  startLabel: PropTypes.string,
  joinLabel: PropTypes.string,
  introduction: PropTypes.string,
  enableDebugUI: PropTypes.bool,
  enableTutorial: PropTypes.bool,
  compressorRatio: PropTypes.number,
  compressorThreshold: PropTypes.number,
  accentColour: PropTypes.string,
  playerImageId: PropTypes.string,
  onChangeSetting: PropTypes.func.isRequired,
  onReplaceCoverImage: PropTypes.func.isRequired,
};

Presentation.defaultProps = {
  title: undefined,
  subtitle: undefined,
  startLabel: undefined,
  joinLabel: undefined,
  introduction: undefined,
  enableDebugUI: undefined,
  enableTutorial: undefined,
  compressorRatio: undefined,
  compressorThreshold: undefined,
  accentColour: undefined,
  playerImageId: undefined,
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
    enableTutorial,
    compressorRatio,
    compressorThreshold,
    playerImageId,
  } = settings;

  return {
    title,
    subtitle,
    startLabel,
    joinLabel,
    introduction,
    accentColour,
    enableDebugUI,
    enableTutorial,
    compressorRatio,
    compressorThreshold,
    playerImageId,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
  onReplaceCoverImage: () => dispatch(requestReplaceProjectPlayerImage(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Presentation);
