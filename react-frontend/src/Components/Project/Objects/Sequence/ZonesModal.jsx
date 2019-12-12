import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Header,
  Button,
  Table,
  Form,
} from 'semantic-ui-react';
import RequiredTextInput from '../../../RequiredTextInput';
import ConfirmDeleteButton from '../../../ConfirmDeleteButton';

class ZonesModal extends React.Component {
  constructor(props) {
    super(props);

    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = { newZoneName: '' };
  }

  handleBlur(e, zoneId) {
    const { onRenameZone } = this.props;
    onRenameZone(zoneId, e.target.value);
  }

  handleChange(e, { name, value }) {
    this.setState({ [name]: value });
  }

  handleSubmit() {
    const { onAddZone } = this.props;
    const { newZoneName } = this.state;
    this.setState({ newZoneName: '' });
    onAddZone(newZoneName);
  }

  render() {
    const {
      onDeleteZone,
      onClose,
      zones,
      open,
    } = this.props;

    const { newZoneName } = this.state;

    return (
      <Modal
        open={open}
        onClose={onClose}
        closeIcon
        size="small"
      >
        <Header icon="cog" content="Manage Device Tags" />
        <Modal.Content>
          {'The same device tags are used by all sequences in the project. Tag names cannot be changed, but the display name used in the user interface can.'}
        </Modal.Content>
        <Modal.Content>
          { (zones && zones.length > 0)
            ? (
              <Table collapsing relaxed="very">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell content="Tag" />
                    <Table.HeaderCell collapsing content="Display name" />
                    <Table.HeaderCell collapsing />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  { zones.map(({ zoneId, name, friendlyName }) => (
                    <Table.Row key={zoneId}>
                      <Table.Cell content={<strong>{name}</strong>} />
                      <Table.Cell>
                        <RequiredTextInput
                          defaultValue={friendlyName}
                          onBlur={e => this.handleBlur(e, zoneId)}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <ConfirmDeleteButton
                          header="Delete tag"
                          name={name}
                          onDelete={() => onDeleteZone(zoneId)}
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )
            : 'No tags are defined for this project yet.'
          }
        </Modal.Content>
        <Modal.Content>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input
              name="newZoneName"
              onChange={this.handleChange} 
              placeholder="New tag name..."
              icon="plus"
              iconPosition="left"
              value={newZoneName}
              action={{ content: 'Add tag', primary: true }}
            />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content="close" onClick={onClose} />
        </Modal.Actions>
      </Modal>
    );
  }
}

ZonesModal.propTypes = {
  onAddZone: PropTypes.func.isRequired,
  onDeleteZone: PropTypes.func.isRequired,
  onRenameZone: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  zones: PropTypes.arrayOf(PropTypes.shape({
    zoneId: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
  })),
};

ZonesModal.defaultProps = {
  zones: [],
};

export default ZonesModal;
