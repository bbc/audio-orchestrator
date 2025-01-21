import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import InlineHelpPopup from '#Components/InlineHelpPopup.jsx';
import { runAlgorithmWithExportedMetadata } from '#Actions/monitoring.js';
import {
  useControls, useObjectsList, useCurrentSetup, useObjects,
} from './helpers.js';

function RunAlgorithmButton({
  projectId,
  currentSequenceId,
}) {
  const objectsList = useObjectsList(projectId, currentSequenceId);
  const objects = useObjects(projectId, currentSequenceId);
  const controls = useControls(projectId);
  const devices = useCurrentSetup(projectId);
  const dispatch = useDispatch();

  return (
    <InlineHelpPopup
      content="Rerun the allocation algorithm to see other possible allocations."
      className="ui buttons"
    >
      <Button
        icon="refresh"
        onClick={() => dispatch(
          runAlgorithmWithExportedMetadata(
            objectsList,
            objects,
            controls,
            devices,
            currentSequenceId,
          ),
        )}
      />
    </InlineHelpPopup>
  );
}

RunAlgorithmButton.propTypes = {
  projectId: PropTypes.string.isRequired,
  currentSequenceId: PropTypes.string.isRequired,
};

export default RunAlgorithmButton;
