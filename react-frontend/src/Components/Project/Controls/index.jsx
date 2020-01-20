import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Message,
  Card,
  Segment,
  Header,
  Icon,
} from 'semantic-ui-react';
import AddControlButton from './AddControlButton';
import ControlCard from './ControlCard';
import {
  addControl,
  deleteControl,
  replaceControlProperty,
} from '../../../actions/project';

const Controls = ({
  controlsList,
  controls,
  sequencesList,
  onAddControl,
  onChangeControl,
  onDeleteControl,
}) => (
  <Container>
    <Message icon="lightbulb outline" header="Controls" content="Controls are displayed on the listeners' devices so they can make choices that affect object rendering." />
    { (controlsList.length > 0)
      ? (
        <Card.Group stackable doubling itemsPerRow={2}>
          { controlsList.map(({ controlId }) => (
            <ControlCard
              key={controlId}
              onDelete={() => onDeleteControl(controlId)}
              onChange={(name, value) => onChangeControl(controlId, name, value)}
              {...controls[controlId]}
              sequencesList={sequencesList}
            />
          ))}
          <Card key="add-control">
            <Card.Content>
              <Segment placeholder textAlign="center">
                <Header content="More controls" subheader="You can add as many controls as you like..." />
                <AddControlButton onAddControl={onAddControl} />
              </Segment>
            </Card.Content>
          </Card>
        </Card.Group>
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
  sequencesList: PropTypes.arrayOf(PropTypes.shape({
    sequenceId: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
  onAddControl: PropTypes.func.isRequired,
  onChangeControl: PropTypes.func.isRequired,
  onDeleteControl: PropTypes.func.isRequired,
};

const mapStateToProps = ({ Project }, { projectId }) => {
  const project = Project.projects[projectId];
  const { controlsList, controls, sequencesList } = project;

  return {
    controlsList,
    controls,
    sequencesList,
  };
};

const mapDispatchToProps = (dispatch, { projectId }) => ({
  onAddControl: (type, name, parameters, defaultValues) => dispatch(
    addControl(projectId, type, name, parameters, defaultValues),
  ),
  onChangeControl: (controlId, name, value) => dispatch(replaceControlProperty(
    projectId, controlId, name, value,
  )),
  onDeleteControl: controlId => dispatch(deleteControl(projectId, controlId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
