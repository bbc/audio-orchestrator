import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Menu,
  Segment,
  Grid,
} from 'semantic-ui-react';
import ImageDetails from '#Components/ImageDetails.jsx';
import ImageEffectButton from './ImageEffectButton.jsx';

const imagesPerPage = 3 * 9; // 9 per row at max window width

function ImageFileList({
  images,
  imagesList,
  imagesLoading,
  onAddImages,
  selectedImageId,
  onSelectImage,
}) {
  const numPages = Math.ceil(imagesList.length / imagesPerPage);
  const selectedImageIndex = useMemo(
    () => imagesList.indexOf(selectedImageId),
    [imagesList, selectedImageId],
  );
  const selectedImagePage = Math.floor(Math.max(0, selectedImageIndex) / imagesPerPage);
  const [page, setPage] = useState(selectedImagePage);

  const currentPageImages = imagesList
    .slice(page * imagesPerPage, (page + 1) * imagesPerPage)
    .map((imageId) => images[imageId]);

  return (
    <Grid>
      <Grid.Column width="11">
        <Menu attached="top">
          <Menu.Item
            icon="angle double left"
            onClick={() => setPage(0)}
            disabled={page === 0}
          />
          <Menu.Item
            icon="angle left"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page < 1}
          />
          <Menu.Item content={`Page ${page + 1} / ${numPages}`} />
          <Menu.Item
            icon="angle right"
            onClick={() => setPage(Math.min(page + 1, numPages - 1))}
            disabled={page > numPages - 2}
          />
          <Menu.Item
            icon="angle double right"
            onClick={() => setPage(numPages - 1)}
            disabled={page === numPages - 1}
          />
          <Menu.Item position="right" content={`${imagesList.length} images`} />
        </Menu>
        <Segment attached loading={imagesLoading} placeholder={imagesList.length === 0}>
          {currentPageImages.map(({ imageId, imagePath, imageAlt }) => (
            <ImageEffectButton
              key={imageId}
              loading={imagesLoading}
              selected={imageId === selectedImageId}
              src={`file://${imagePath}`}
              alt={imageAlt}
              onClick={() => onSelectImage(imageId)}
              large
            />
          ))}
        </Segment>
        <Segment attached="bottom">
          <Button
            icon="plus"
            primary
            labelPosition="left"
            content="Import image files"
            onClick={() => { onAddImages(); setPage(0); }}
          />
        </Segment>
      </Grid.Column>
      <Grid.Column width="5">
        {selectedImageId && <ImageDetails imageId={selectedImageId} />}
      </Grid.Column>
    </Grid>
  );
}

ImageFileList.propTypes = {
  images: PropTypes.shape({}).isRequired,
  imagesList: PropTypes.arrayOf(PropTypes.string).isRequired,
  imagesLoading: PropTypes.bool.isRequired,
  onAddImages: PropTypes.func.isRequired,
  onSelectImage: PropTypes.func.isRequired,
  selectedImageId: PropTypes.string,
};

ImageFileList.defaultProps = {
  selectedImageId: undefined,
};

export default ImageFileList;
