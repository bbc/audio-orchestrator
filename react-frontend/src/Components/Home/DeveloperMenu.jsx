import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Modal,
  Menu,
  Button,
} from 'semantic-ui-react';

import {
  requestOpenDevTools,
} from '../../actions/developer';

const DeveloperMenu = ({
  onOpenDevTools,
}) => (
  <Modal closeIcon centered={false} trigger={<Menu.Item position="right" icon="cog" />}>
    <Modal.Header content="Developer Tools" />
    <Modal.Content>
      <Button primary icon="cogs" content="Open Developer Tools" onClick={onOpenDevTools} />
    </Modal.Content>
  </Modal>
);

DeveloperMenu.propTypes = {
  onOpenDevTools: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onOpenDevTools: () => dispatch(requestOpenDevTools()),
});

export default connect(null, mapDispatchToProps)(DeveloperMenu);
