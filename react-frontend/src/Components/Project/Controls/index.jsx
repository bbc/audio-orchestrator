import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Message,
  Table,
  Segment,
  Header,
  Icon,
} from 'semantic-ui-react';
import AddControlButton from './AddControlButton';
import ControlRow from './ControlRow';
import {
  addControl,
  deleteControl,
  replaceControlProperty,
} from '../../../actions/project';

const Controls = ({
  controlsList,
  controls,
  onAddControl,
  onChangeControl,
  onDeleteControl,
}) => (
  <Container>
    <Message icon="lightbulb outline" header="Controls" content="Controls are displayed on the listeners' devices so they can make choices that affect object rendering." />
    { (controlsList.length > 0)
      ? (
        <div>
          <Table relaxed="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell content="Control" />
                <Table.HeaderCell content="Parameters" />
                <Table.HeaderCell content="Behaviours" />
                <Table.HeaderCell collapsing />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              { controlsList.map(({ controlId, controlName, controlType }) => (
                <ControlRow
                  key={controlId}
                  onDelete={() => onDeleteControl(controlId)}
                  onChange={(name, value) => onChangeControl(controlId, name, value)}
                  controlName={controlName}
                  controlType={controlType}
                />
              ))}
            </Table.Body>
          </Table>
          <AddControlButton onAddControl={onAddControl} />
        </div>
      )
      : (
        <Segment placeholder textAlign="center">
          <Header icon>
            <Icon name="tasks" />
            Add a control to get started.
          </Header>
          <AddControlButton onAddControl={onAddControl} />
        </Segment>
      )
    }
  </Container>
);

Controls.propTypes = {
  controlsList: PropTypes.arrayOf(PropTypes.shape({
    controlId: PropTypes.string,
    controlName: PropTypes.string,
    controlType: PropTypes.string,
  })).isRequired,
  controls: PropTypes.shape({}).isRequired,
  onAddControl: PropTypes.func.isRequired,
  onChangeControl: PropTypes.func.isRequired,
  onDeleteControl: PropTypes.func.isRequired,
};

const mapStateToProps = ({ Project }, { projectId }) => {
  const project = Project.projects[projectId];
  const { controlsList, controls } = project;

  return {
    controlsList,
    controls,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onAddControl: (type, name) => dispatch(addControl(projectId, type, name)),
  onChangeControl: (controlId, name, value) => dispatch(replaceControlProperty(
    projectId, controlId, name, value,
  )),
  onDeleteControl: controlId => dispatch(deleteControl(projectId, controlId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
