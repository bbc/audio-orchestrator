import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import {
  Button,
  Table,
  Modal,
  Segment,
  Header,
  Icon,
} from 'semantic-ui-react';
import ImageFileList from './ImageFileList.jsx';
import EffectEditor from './EffectEditor.jsx';
import ImageItemRow from './ImageItemRow.jsx';

function ImageItemTable({
  imageItems,
  imagesList,
  sequenceDuration,
  images,
  imagesLoading,
  onChange,
  onAddImages,
}) {
  const [imageSelectionItemId, setImageSelectionItemId] = useState(null);
  const [effectEditorItemId, setEffectEditorItemId] = useState(null);

  const selectedImageId = (imageItems
    .find((item) => item.itemId === imageSelectionItemId) || {}).imageId;

  const selectedEffect = (imageItems
    .find((item) => item.itemId === effectEditorItemId) || {}).effect;

  const handleOpenImageSelection = (itemId) => {
    setImageSelectionItemId(itemId);
  };

  const handleCloseImageSelection = () => {
    setImageSelectionItemId(null);
  };

  const handleOpenEffectEditor = (itemId) => {
    setEffectEditorItemId(itemId);
  };

  const handleCloseEffectEditor = () => {
    setEffectEditorItemId(null);
  };

  const handleChangeItem = (itemId, value) => {
    onChange(imageItems.map((item) => {
      if (item.itemId === itemId) {
        return {
          ...item,
          ...value,
        };
      }
      return item;
    }));
  };

  const handleChangeImageId = (itemId, value) => {
    handleChangeItem(itemId, { imageId: value });
  };

  const handleSelectImage = (imageId) => {
    if (imageSelectionItemId) {
      handleChangeImageId(imageSelectionItemId, imageId);
    }
  };

  const handleChangeEffect = (value) => {
    if (effectEditorItemId) {
      handleChangeItem(effectEditorItemId, { effect: value });
    }
  };

  const handleAddItem = () => {
    const lastImageItem = imageItems[imageItems.length - 1];

    const start = lastImageItem ? lastImageItem.start + lastImageItem.duration : 0;

    onChange([
      ...imageItems,
      {
        itemId: uuidv4(),
        start,
        duration: Math.min(1, Math.max(0, sequenceDuration - start)),
        priority: 1,
      },
    ]);
  };

  const handleDeleteItem = (itemId) => {
    onChange(imageItems.filter((item) => item.itemId !== itemId));
  };

  const handleSortByStartTime = () => {
    onChange([...imageItems].sort((a, b) => a.start - b.start));
  };

  if (imageItems.length === 0) {
    return (
      <Segment placeholder>
        <Header icon content="Add an item to get started." />
        <Button icon="plus" primary content="Add item" labelPosition="left" onClick={handleAddItem} />
      </Segment>
    );
  }

  return (
    <>
      <Table basic="very" unstackable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell content="Image" collapsing />
            <Table.HeaderCell content="Effect" collapsing />
            <Table.HeaderCell collapsing>
              Start time (seconds)
              {' '}
              <Icon name="sort numeric ascending" onClick={handleSortByStartTime} />
            </Table.HeaderCell>
            <Table.HeaderCell content="End time (seconds)" collapsing />
            <Table.HeaderCell />
            <Table.HeaderCell collapsing />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {imageItems.map((item) => (
            <ImageItemRow
              key={item.itemId}
              items={imageItems}
              item={item}
              images={images}
              imagesLoading={imagesLoading}
              onReplaceImage={() => handleOpenImageSelection(item.itemId)}
              onReplaceEffect={() => handleOpenEffectEditor(item.itemId)}
              onChange={(value) => handleChangeItem(item.itemId, value)}
              sequenceDuration={sequenceDuration}
              onDelete={() => handleDeleteItem(item.itemId)}
            />
          ))}
        </Table.Body>
      </Table>

      {imageSelectionItemId !== null && (
        <Modal open closeIcon onClose={handleCloseImageSelection}>
          <Modal.Header content="Replace image for item" />
          <Modal.Content>
            <ImageFileList
              images={images}
              imagesList={imagesList}
              imagesLoading={imagesLoading}
              onAddImages={onAddImages}
              onSelectImage={handleSelectImage}
              selectedImageId={selectedImageId}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button
              negative
              icon="dont"
              labelPosition="left"
              content="Clear image"
              onClick={() => {
                handleSelectImage(undefined);
                handleCloseImageSelection();
              }}
            />
            <Button primary content="Save and close" onClick={handleCloseImageSelection} />
          </Modal.Actions>
        </Modal>
      )}

      {effectEditorItemId !== null && (
        <Modal open closeIcon onClose={handleCloseEffectEditor}>
          <Modal.Header content="Edit lighting effect for item" />
          <Modal.Content>
            <EffectEditor
              effect={selectedEffect}
              onChange={handleChangeEffect}
            />
          </Modal.Content>
          <Modal.Actions>
            <Button
              negative
              icon="dont"
              labelPosition="left"
              content="Clear effect"
              onClick={() => {
                handleChangeEffect(undefined);
                handleCloseEffectEditor();
              }}
            />
            <Button primary content="Save and close" onClick={handleCloseEffectEditor} />
          </Modal.Actions>
        </Modal>
      )}
      <Button icon="plus" primary content="Add item" labelPosition="left" onClick={handleAddItem} />
    </>
  );
}

ImageItemTable.propTypes = {
  imageItems: PropTypes.arrayOf(PropTypes.shape({
    itemId: PropTypes.string.isRequired,
    start: PropTypes.number,
    duration: PropTypes.number,
    imageId: PropTypes.string,
  })),
  onChange: PropTypes.func.isRequired,

  sequenceDuration: PropTypes.number.isRequired,
  images: PropTypes.shape({}),
  imagesList: PropTypes.arrayOf(PropTypes.string).isRequired,
  imagesLoading: PropTypes.bool,
  onAddImages: PropTypes.func.isRequired,
};

ImageItemTable.defaultProps = {
  images: {},
  imageItems: [],
  imagesLoading: false,
};

export default ImageItemTable;
