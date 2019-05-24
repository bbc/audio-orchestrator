import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4';
import {
  Container,
  Message,
  Table,
  Input,
  Button,
} from 'semantic-ui-react';
import {
  getProjectSettings,
  setProjectSetting,
} from '../../actions/project';

class Rules extends React.Component {
  constructor(props) {
    super(props);

    this.handleBlur = (e, id) => {
      const { onChangeSetting, zones } = this.props;
      const { name, value } = e.target;

      const newZones = zones.map((zone) => {
        if (zone.zoneId !== id) {
          return zone;
        }

        return {
          ...zone,
          [name]: value,
        };
      });

      onChangeSetting('zones', newZones);
    };

    this.handleAddZone = () => {
      const { onChangeSetting, zones } = this.props;

      onChangeSetting('zones', [
        ...zones,
        { name: `newZone-${zones.length}`, friendlyName: `New zone ${zones.length}`, zoneId: uuidv4() },
      ]);
    };


    this.handleDeleteZone = (id) => {
      const { onChangeSetting, zones } = this.props;

      onChangeSetting('zones', zones.filter(({ zoneId }) => (zoneId !== id)));
    };
  }

  componentDidMount() {
    const { onGetProjectSettings } = this.props;
    onGetProjectSettings();
  }

  render() {
    const {
      zones,
    } = this.props;

    return (
      <Container>
        <Message icon="lightbulb outline" header="Rendering Rules" content="You can customise the zones used for allocating objects to devices; these must match the metadata fields in all sequences." />

        <Table collapsing>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell content="Name used in metadata" />
              <Table.HeaderCell content="Friendly name" />
              <Table.HeaderCell content="" />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            { zones.map(({ zoneId, name, friendlyName }) => (
              <Table.Row key={zoneId}>
                <Table.Cell>
                  <Input
                    name="name"
                    defaultValue={name}
                    onBlur={e => this.handleBlur(e, zoneId)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Input
                    name="friendlyName"
                    defaultValue={friendlyName}
                    onBlur={e => this.handleBlur(e, zoneId)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Button negative icon="delete" onClick={() => this.handleDeleteZone(zoneId)} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <p>
          <Button content="Add zone" onClick={this.handleAddZone} icon="plus" labelPosition="left" />
        </p>
      </Container>
    );
  }
}

Rules.propTypes = {
  onChangeSetting: PropTypes.func.isRequired,
  onGetProjectSettings: PropTypes.func.isRequired,
  zones: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    friendlyName: PropTypes.string,
  })),
};

Rules.defaultProps = {
  zones: [],
};

const mapStateToProps = (state, { projectId }) => {
  const project = state.Project.projects[projectId];

  const {
    zones,
  } = project.settings;

  return {
    zones,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onChangeSetting: (key, value) => dispatch(setProjectSetting(projectId, key, value)),
  onGetProjectSettings: () => dispatch(getProjectSettings(projectId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Rules);
