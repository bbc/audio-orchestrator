import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import ImageItemTable from '../ImageItems/ImageItemTable';

const ImageItemsInput = ({
  value,
  onChange,
  sequenceDuration,
  images,
  imagesLoading,
  onAddImages,
}) => {
  const imagesList = useMemo(
    () => Object.keys(images).sort((a, b) => images[b].imageIndex - images[a].imageIndex),
    [images],
  );

  return (
    <ImageItemTable
      imageItems={value}
      onChange={newValue => onChange(null, { value: newValue })}
      sequenceDuration={sequenceDuration}
      images={images}
      imagesList={imagesList}
      imagesLoading={imagesLoading}
      onAddImages={onAddImages}
    />
  );
};

ImageItemsInput.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape({
  })).isRequired,
  onChange: PropTypes.func.isRequired,
  sequenceDuration: PropTypes.number.isRequired,
  images: PropTypes.shape({}).isRequired,
  imagesLoading: PropTypes.bool.isRequired,
  onAddImages: PropTypes.func.isRequired,
};

export default ImageItemsInput;
