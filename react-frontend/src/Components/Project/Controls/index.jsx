import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Message,
  Table,
  Form,
} from 'semantic-ui-react';
import RequiredTextInput from '../../RequiredTextInput';
import ConfirmDeleteButton from '../../ConfirmDeleteButton';
import {
  deleteZone,
  renameZone,
  addZone,
} from '../../../actions/project';

class Controls extends React.Component {
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
      zones,
    } = this.props;

    const { newZoneName } = this.state;

    return (
      <Container>
        <Message icon="lightbulb outline" header="Controls" content="The same device tags are used by all sequences in the project. Tag names cannot be changed, but the display name used in the user interface can." />
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
          : <Message content="No tags are defined for this project yet." />
        }
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
      </Container>
    );
  }
}

Controls.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.shape({
    zoneId: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
  })),
  onDeleteZone: PropTypes.func.isRequired,
  onAddZone: PropTypes.func.isRequired,
  onRenameZone: PropTypes.func.isRequired,
};

Controls.defaultProps = {
  zones: [],
};

const mapStateToProps = ({ Project }, { projectId }) => {
  const project = Project.projects[projectId];
  const { settings } = project;
  const { zones } = settings;

  return {
    zones,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onAddZone: name => dispatch(addZone(projectId, name)),
  onRenameZone: (zoneId, friendlyName) => dispatch(renameZone(projectId, zoneId, friendlyName)),
  onDeleteZone: zoneId => dispatch(deleteZone(projectId, zoneId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
