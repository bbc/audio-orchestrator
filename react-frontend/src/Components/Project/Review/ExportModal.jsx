import React from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  Button,
  Progress,
} from 'semantic-ui-react';
import {
  requestCancelExport,
  requestOpenInFolder,
} from '../../../actions/export';

const ExportModal = ({
  title,
  stepTitle,
  error,
  running,
  complete,
  failed,
  progressPercent,
  closed,
  outputPath,
  requestCancelExport,
  requestOpenInFolder,
}) => {
  let progressDescription = stepTitle;
  let intro = 'This might take a few minutes, please stand by.';

  if (failed) {
    progressDescription = error;
    intro = 'The export has failed.';
  }

  if (complete) {
    progressDescription = 'Finished!';
    intro = `The exported files have been stored in ${outputPath}.`;
  }

  return (
    <Modal centered={false} open={running || ((failed || complete) && !closed)}>
      <Modal.Header content={`Export as ${title}`} />
      <Modal.Content>
        <p>{ intro }</p>
        <Progress indicating percent={progressPercent} error={failed} success={complete}>
          {progressDescription}
        </Progress>
      </Modal.Content>
      <Modal.Actions>
        { complete
          ? <Button icon="external" content="Show in folder" onClick={() => requestOpenInFolder(outputPath)} />
          : null
        }
        { running
          ? <Button negative primary content="Cancel" onClick={requestCancelExport} />
          : <Button primary content="Close" onClick={requestCancelExport} />
        }
      </Modal.Actions>
    </Modal>
  );
};

const mapStateToProps = ({ Export }) => ({
  ...Export,
});

const mapDispatchToProps = dispatch => ({
  requestCancelExport: () => dispatch(requestCancelExport()),
  requestOpenInFolder: path => dispatch(requestOpenInFolder(path)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportModal);
