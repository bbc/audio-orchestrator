import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Image,
  Message,
} from 'semantic-ui-react';


const ImagePreview = ({
  imagePath,
  error,
}) => (
  <Image wrapped src={`file://${imagePath}`}>
    { error
      ? (
        <Message
          attached
          negative
          icon="warning"
          content={error}
        />
      )
      : null
    }
  </Image>
);

ImagePreview.propTypes = {
  imagePath: PropTypes.string.isRequired,
  error: PropTypes.string,
};

ImagePreview.defaultProps = {
  error: undefined,
};

const mapStateToProps = (state, { projectId, imageId }) => {
  const project = state.Project.projects[projectId];
  const { images } = project;
  const image = images[imageId] || {};
  const { imagePath, error } = image;

  return {
    imagePath,
    error,
  };
};

export default connect(mapStateToProps)(ImagePreview);
