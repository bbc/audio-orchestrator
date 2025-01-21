import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Input,
  Table,
  Icon,
  Popup,
} from 'semantic-ui-react';
import ConfirmDeleteButton from '#Components/ConfirmDeleteButton.jsx';
import ImageEffectButton from './ImageEffectButton.jsx';
import RangePreview from './RangePreview.jsx';

const getNextItem = (item, items) => {
  const index = items.indexOf(item);

  if (index === -1 || index >= items.length - 1) {
    return null;
  }

  return items[index + 1];
};

const getPreviousItem = (item, items) => {
  const index = items.indexOf(item);

  if (index === -1 || index < 1) {
    return null;
  }

  return items[index - 1];
};

function ImageItemRow({
  items,
  item,
  images,
  imagesLoading,
  onChange,
  onReplaceImage,
  onReplaceEffect,
  sequenceDuration,
  onDelete,
}) {
  const {
    itemId,
    imageId,
    start,
    duration,
    effect,
  } = item;
  // store the most recently typed text even if it is invalid in the component state;
  // only calling the onChange handler when it is valid
  const [displayStart, setDisplayStart] = useState(start);
  const [displayEnd, setDisplayEnd] = useState(start + duration);
  const errorStart = start === undefined;
  const errorEnd = duration === undefined;

  // copy the new start and duration values into the display state when props change
  useEffect(() => {
    if (start !== undefined) {
      setDisplayStart(start);
    }
    if (start !== undefined && duration !== undefined) {
      setDisplayEnd(start + duration);
    }
  }, [start, duration]);

  // handler for when duration is edited - calls on change if duration is valid
  const handleChangeDuration = (value) => {
    const newDuration = parseFloat(value);
    if (!Number.isNaN(newDuration)) {
      onChange({ duration: newDuration });
    }
  };

  // handler for when start time is edited - stretches the item so that end stays the same.
  const handleChangeStart = (value) => {
    const newStart = parseFloat(value);

    // Validate start - setting undefined triggers error state
    if (!Number.isNaN(newStart) && newStart >= 0 && newStart <= sequenceDuration) {
      // calculate new duration using either duration or display end fields
      // aim is to leave end time display unchanged, except when start is greater than end time
      let newDuration = duration;
      if (!errorEnd && start !== undefined) {
        newDuration = Number(Math.max(0, start + duration - newStart).toFixed(3));
      } else if (!Number.isNaN(parseFloat(displayEnd))) {
        newDuration = Math.max(0, displayEnd - newStart);
      }

      onChange({
        start: newStart,
        duration: newDuration,
      });
    } else {
      // start is not valid, but set display value to still update the form field
      setDisplayStart(value);
      onChange({
        start: undefined,
      });
    }
  };

  // handler for when end time is edited - actually changes the duration, keeping start the same.
  const handleChangeEnd = (value) => {
    const newEnd = parseFloat(value);
    if (!Number.isNaN(newEnd) && newEnd >= start) {
      handleChangeDuration(Math.max(0, (newEnd - start).toFixed(3)));
    } else {
      // new end isn't valid but still update the displayed value
      setDisplayEnd(value);
      onChange({
        duration: undefined,
      });
    }
  };

  // handler for extending the start time of the item to the end of the previous item.
  const handleExtendBackward = () => {
    const previousItem = getPreviousItem(item, items);
    if (previousItem) {
      handleChangeStart(previousItem.start + previousItem.duration);
    } else {
      handleChangeStart(0);
    }
  };

  // handler for extending the end time of the item to the start of the next item.
  const handleExtendForward = () => {
    const nextItem = getNextItem(item, items);
    if (nextItem) {
      handleChangeEnd(nextItem.start);
    } else {
      handleChangeEnd(sequenceDuration);
    }
  };

  return (
    <Table.Row
      key={itemId}
    >
      <Table.Cell>
        {imageId
          ? (
            <ImageEffectButton
              loading={imagesLoading}
              onClick={onReplaceImage}
              src={images[imageId] && `file://${images[imageId].imagePath}`}
            />
          )
          : (
            <Popup
              inverted
              basic
              content="Add an image to this item."
              trigger={(
                <Button compact basic icon onClick={onReplaceImage}>
                  <Icon.Group size="large">
                    <Icon name="image outline" />
                    <Icon corner name="add" />
                  </Icon.Group>
                </Button>
              )}
            />
          )}
      </Table.Cell>
      <Table.Cell>
        {effect
          ? (
            <ImageEffectButton
              onClick={onReplaceEffect}
              effect={effect}
            />
          )
          : (
            <Popup
              inverted
              basic
              content="Add a coloured lighting effect to this item."
              trigger={(
                <Button compact basic icon onClick={onReplaceEffect}>
                  <Icon.Group size="large">
                    <Icon name="lightbulb outline" />
                    <Icon corner name="add" />
                  </Icon.Group>
                </Button>
              )}
            />
          )}
      </Table.Cell>
      <Table.Cell>
        <Input
          name="start"
          onChange={(e, { value }) => handleChangeStart(value)}
          value={displayStart === undefined ? '' : displayStart}
          error={errorStart}
          label={(
            <Button
              icon="step backward"
              onClick={() => handleExtendBackward(itemId)}
            />
          )}
          labelPosition="left"
          type="number"
        />
      </Table.Cell>
      <Table.Cell>
        <Input
          name="end"
          onChange={(e, { value }) => handleChangeEnd(value)}
          value={displayEnd === undefined ? '' : displayEnd}
          error={errorEnd}
          action={(
            <Button
              icon="step forward"
              onClick={() => handleExtendForward(itemId)}
            />
          )}
          labelPosition="right"
          type="number"
        />
      </Table.Cell>
      <Table.Cell>
        <RangePreview min={0} max={sequenceDuration} start={start} end={duration + start} />
      </Table.Cell>
      <Table.Cell textAlign="right">
        <ConfirmDeleteButton onDelete={onDelete} type="item" />
      </Table.Cell>
    </Table.Row>
  );
}

ImageItemRow.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  item: PropTypes.shape({
    itemId: PropTypes.string.isRequired,
    imageId: PropTypes.string,
    start: PropTypes.number,
    duration: PropTypes.number,
    effect: PropTypes.shape({}),
  }).isRequired,
  images: PropTypes.shape({}).isRequired,
  imagesLoading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onReplaceImage: PropTypes.func.isRequired,
  onReplaceEffect: PropTypes.func.isRequired,
  sequenceDuration: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ImageItemRow;
