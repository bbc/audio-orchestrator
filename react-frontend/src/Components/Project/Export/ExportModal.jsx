import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Modal,
  Button,
  Progress,
} from 'semantic-ui-react';
import {
  requestCancelExport,
  requestOpenInFolder,
  requestOpenUrl,
} from '../../../actions/export';
import QRCode from './QRCode';

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
  cancelExport,
  openInFolder,
  openUrl,
}) => {
  let progressDescription = stepTitle;
  const preview = (title === 'preview');
  let intro = 'This might take a few minutes, please stand by.';

  if (failed) {
    progressDescription = error;
    intro = 'The export has failed.';
  }

  if (complete) {
    progressDescription = 'Finished!';
    if (preview) {
      intro = `The preview server is running at ${outputPath}.`;
    } else {
      intro = `The exported files have been stored in ${outputPath}.`;
    }
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
      { preview && complete
        ? (
          <Modal.Content content={<QRCode url={outputPath} />} />
        ) : null }
      <Modal.Actions>
        { complete && preview
          ? <Button icon="external" content="Open in browser" onClick={() => openUrl(outputPath)} />
          : null
        }
        { complete && preview
          ? <Button icon="stop" negative content="Stop preview" onClick={cancelExport} />
          : null
        }
        { complete && !preview
          ? <Button icon="external" content="Show in folder" onClick={() => openInFolder(outputPath)} />
          : null
        }
        { running
          ? <Button negative primary content="Cancel" onClick={cancelExport} />
          : null
        }
        { (!running && !preview) || error
          ? <Button primary content="Close" onClick={cancelExport} />
          : null
        }
      </Modal.Actions>
    </Modal>
  );
};

ExportModal.propTypes = {
  title: PropTypes.string.isRequired,
  stepTitle: PropTypes.string.isRequired,
  error: PropTypes.string,
  running: PropTypes.bool.isRequired,
  complete: PropTypes.bool.isRequired,
  failed: PropTypes.bool.isRequired,
  progressPercent: PropTypes.number.isRequired,
  closed: PropTypes.bool.isRequired,
  outputPath: PropTypes.string,
  cancelExport: PropTypes.func.isRequired,
  openInFolder: PropTypes.func.isRequired,
  openUrl: PropTypes.func.isRequired,
};

ExportModal.defaultProps = {
  error: null,
  outputPath: null,
};

const mapStateToProps = ({ Export }) => ({
  ...Export,
});

const mapDispatchToProps = dispatch => ({
  cancelExport: () => dispatch(requestCancelExport()),
  openInFolder: path => dispatch(requestOpenInFolder(path)),
  openUrl: url => dispatch(requestOpenUrl(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ExportModal);
