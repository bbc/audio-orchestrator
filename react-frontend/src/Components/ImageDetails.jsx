import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card,
  Form,
  Image,
  Message,
  Placeholder,
} from 'semantic-ui-react';
import { setImageAlt } from 'Actions/project';
import { useProjectId, useProject } from 'Components/utils';
import EditableText from 'Components/Project/EditableText';

const ImageDetails = ({
  imageId,
}) => {
  // TODO check if it makes sense to access state and dispatch here rather than in a parent.
  const projectId = useProjectId();
  const [imagesLoading, images] = useProject(project => [project.imagesLoading, project.images]);

  const dispatch = useDispatch();

  const image = images[imageId] || null;
  const {
    imagePath,
    imageAlt,
    imageFilename,
    error,
  } = image || {};

  return (
    <Card>
      { imagesLoading
        ? <Placeholder.Image square />
        : <Image wrapped src={`file://${imagePath}`} ui={false} />
      }
      <Card.Content>
        { !imagesLoading && error && (
          <Message negative content={error} />
        )}
        <Card.Meta content={imageFilename} />
      </Card.Content>
      <Card.Content>
        <Form>
          <Form.Input label="Alternative text">
            <EditableText
              value={imageAlt || ''}
              onChange={value => dispatch(setImageAlt(projectId, imageId, value))}
            />
          </Form.Input>
        </Form>
      </Card.Content>
    </Card>
  );
};

ImageDetails.propTypes = {
  imageId: PropTypes.string.isRequired,
};

export default ImageDetails;
