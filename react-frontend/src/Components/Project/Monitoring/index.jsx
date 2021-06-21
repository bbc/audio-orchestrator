import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Menu,
  Tab,
  Message,
} from 'semantic-ui-react';
import { resetAlgorithmResults } from 'Actions/monitoring';
import { openMonitoringPage } from 'Actions/ui';
import PageTitleBar from '../../PageTitleBar';
import MonitoringTable from './MonitoringTable';
import MonitoringToolbar from './MonitoringToolbar';
import { useSequencesList, useCurrentSequenceId } from './helpers';

const Monitoring = ({
  projectId,
}) => {
  const dispatch = useDispatch();
  const sequencesList = useSequencesList(projectId);
  // Find the currentSequenceId, which is the ID for the sequence that is open in the audio page
  const currentSequenceId = useCurrentSequenceId(projectId);
  const tabPanes = sequencesList.map(({ name, sequenceId }) => ({
    sequenceId,
    menuItem: <Menu.Item key={sequenceId} content={name} />,
    render: () => (
      <Tab.Pane>
        <MonitoringToolbar projectId={projectId} currentSequenceId={currentSequenceId} />
        <MonitoringTable projectId={projectId} sequenceId={sequenceId} />
      </Tab.Pane>
    ),
  }));
  const defaultIndex = tabPanes.findIndex(({
    sequenceId,
  }) => sequenceId === currentSequenceId);
  return (
    <Container>
      <PageTitleBar
        title="Monitoring"
        shortDescription="Check the audio object allocations for different device setups."
        helpId="monitoring" // No entry defined in helpLinks.js due to no documentation yet
      />
      <Tab
        panes={tabPanes}
        activeIndex={defaultIndex}
        onTabChange={(e, { activeIndex }) => {
          dispatch(openMonitoringPage(projectId, tabPanes[activeIndex].sequenceId));
          dispatch(resetAlgorithmResults());
        }}
      />
      { sequencesList.length === 0 && <Message content="There are no sequences to monitor; create them on the Sequences page." />}
    </Container>
  );
};

Monitoring.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default Monitoring;
