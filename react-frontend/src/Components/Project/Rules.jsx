import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4';
import {
  Container,
  Message,
  Table,
  Button,
} from 'semantic-ui-react';
import ConfirmDeleteButton from '../ConfirmDeleteButton';
import RequiredTextInput from '../RequiredTextInput';
import {
  setProjectSetting,
} from '../../actions/project';

class Rules extends React.Component {
  constructor(props) {
    super(props);

    this.nameRefs = {};
    this.addZoneRef = {};

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

    this.handleKeyPress = (e, id) => {
      const { zones } = this.props;
      const { key, target } = e;

      // When the user presses enter inside a form field, ...
      if (key === 'Enter') {
        // Remove focus from that form field, also triggering a save action.
        target.blur();

        // Move to the next row or create a new zone.
        const nextZone = zones[zones.findIndex(zone => zone.zoneId === id) + 1];
        // TODO: removed this because in creating the new zone, it will reset the currently edited
        // zone's name. Should probably be something that happens in the reducer, or uses component
        // state.
        // if (!nextZone) {
        //   this.handleAddZone();
        // } else if (nextZone.zoneId in this.nameRefs) {
        if (nextZone && nextZone.zoneId in this.nameRefs) {
          this.nameRefs[nextZone.zoneId].select();
        }
      }
    };

    this.handleAddZone = () => {
      const { onChangeSetting, zones } = this.props;

      onChangeSetting('zones', [
        ...zones,
        { name: `tag${zones.length + 1}`, friendlyName: `tag${zones.length + 1}`, zoneId: uuidv4() },
      ]);
    };

    this.handleDeleteZone = (id) => {
      const { onChangeSetting, zones } = this.props;

      onChangeSetting('zones', zones.filter(({ zoneId }) => (zoneId !== id)));
    };
  }

  componentDidUpdate(prevProps) {
    const { zones } = this.props;
    // Check if the number of zones has just increased by one, ie. we've just added a zone
    if (prevProps.zones && zones && zones.length === prevProps.zones.length + 1) {
      const lastZoneId = zones[zones.length - 1].zoneId;
      if (lastZoneId in this.nameRefs) {
        this.nameRefs[lastZoneId].select();
      }
    }
  }

  render() {
    const {
      zones,
    } = this.props;

    return (
      <Container>
        <Message icon="lightbulb outline" header="Device tags" content="Tags determine which objects can be in each auxiliary device. Each device selects one tag, but multiple devices can use the same one." />
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
                  <RequiredTextInput
                    ref={(ref) => { this.nameRefs[zoneId] = ref; }}
                    defaultValue={name}
                    name="name"
                    onKeyPress={e => this.handleKeyPress(e, zoneId)}
                    onBlur={e => this.handleBlur(e, zoneId)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <RequiredTextInput
                    name="friendlyName"
                    defaultValue={friendlyName}
                    onKeyPress={e => this.handleKeyPress(e, zoneId)}
                    onBlur={e => this.handleBlur(e, zoneId)}
                  />
                </Table.Cell>
                <Table.Cell>
                  <ConfirmDeleteButton
                    header="Delete Tag"
                    name={name}
                    onDelete={() => this.handleDeleteZone(zoneId)}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <p>
          <Button primary content="Add tag" onClick={this.handleAddZone} icon="plus" labelPosition="left" />
        </p>
      </Container>
    );
  }
}

Rules.propTypes = {
  onChangeSetting: PropTypes.func.isRequired,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(Rules);
