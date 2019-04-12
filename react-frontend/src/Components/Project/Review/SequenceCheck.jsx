import React from 'react';
import { connect } from 'react-redux';

import {
  Table,
  Button,
  Header,
} from 'semantic-ui-react';

const SequenceCheck = ({
  isIntro,
  isMain,
  name,
  numFilesAdded,
  numObjectsAdded,
  allObjectsHaveFiles,
  allFilesAreGood,
  onReviewSequence,
  sequenceId,
}) => {
  let error = null;
  let summary = 'Additional sequence, not used in preview.';
  if (isIntro) {
    summary = 'Intro sequence, optional.';
  } else if (isMain) {
    summary = 'Main sequence, required.';
  }

  if (numFilesAdded === 0) {
    error = 'No audio files have been added.';
  } else if (numObjectsAdded === 0) {
    error = 'No metadata file has been added.';
  } else if (!allObjectsHaveFiles) {
    error = 'Not all objects in the metadata have been matched to audio files.';
  } else if (!allFilesAreGood) {
    error = 'Some audio files have errors.';
  }

  return (
    <Table.Row negative={!!error} positive={!error}>
      <Table.Cell icon={error ? 'exclamation circle' : 'checkmark'} />
      <Table.Cell>
        <Header as="h4" content={`Sequence: ${name}`} subheader={summary} />
        { error || 'Audio files and matching metadata are available.' }
      </Table.Cell>
      <Table.Cell>
        { error
          ? (
            <Button
              content="Review"
              icon="edit"
              labelPosition="left"
              onClick={() => onReviewSequence(sequenceId)}
            />
          )
          : null
        }
      </Table.Cell>
    </Table.Row>
  );
};

const mapStateToProps = ({ Project }, { projectId, sequenceId }) => {
  const project = Project.projects[projectId] || {};
  const sequence = project.sequences[sequenceId] || {};
  const {
    isIntro,
    isMain,
    name,
    filesList,
    objectsList,
    objects,
  } = sequence;

  return {
    isIntro,
    isMain,
    name,
    numFilesAdded: filesList.length || 0,
    numObjectsAdded: objectsList.length || 0,
    allObjectsHaveFiles: objectsList.every(({ objectNumber }) => !!objects[objectNumber].fileId),
    allFilesAreGood: filesList.every(({ error }) => !error),
  };
};

export default connect(mapStateToProps)(SequenceCheck);
