import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Image,
  Message,
  Placeholder,
} from 'semantic-ui-react';

const ImagePreview = ({
  imagePath,
  error,
  loading,
}) => {
  if (loading) {
    return (
      <Placeholder>
        <Placeholder.Image square />
      </Placeholder>
    );
  }

  if (error) {
    return (
      <Message
        attached
        negative
        icon="delete"
        content={error}
      />
    );
  }

  if (imagePath) {
    return (
      <Image wrapped src={loading ? null : `file://${imagePath}`} alt="Preview of the cover image" />
    );
  }

  return null;
};

ImagePreview.propTypes = {
  imagePath: PropTypes.string,
  error: PropTypes.string,
  loading: PropTypes.bool,
};

ImagePreview.defaultProps = {
  loading: false,
  imagePath: undefined,
  error: undefined,
};

const mapStateToProps = (state, { projectId, imageId }) => {
  const project = state.Project.projects[projectId];
  const { images, imagesLoading } = project;
  const image = images[imageId] || {};
  const { imagePath, error } = image;

  return {
    imagePath: (imagesLoading || error) ? null : imagePath,
    loading: imagesLoading,
    error,
  };
};

export default connect(mapStateToProps)(ImagePreview);
