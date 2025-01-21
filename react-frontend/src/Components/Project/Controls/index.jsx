import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Container,
  Card,
  Segment,
  Header,
  Icon,
} from 'semantic-ui-react';
import {
  addControl,
  deleteControl,
  replaceControlProperty,
  swapControlOrder,
} from '#Actions/project.js';
import AddControlButton from './AddControlButton.jsx';
import ControlCard from './ControlCard.jsx';
import PageTitleBar from '../../PageTitleBar.jsx';

class Controls extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleMoveControl = this.handleMoveControl.bind(this);
  }

  handleMoveControl(i, direction) {
    const {
      controlsList,
      onSwapControlOrder,
    } = this.props;

    const {
      controlId,
    } = controlsList[i];

    const {
      controlId: otherControlId,
    } = controlsList[Math.max(0, Math.min(i + direction, controlsList.length - 1))];

    if (controlId !== otherControlId) {
      onSwapControlOrder(controlId, otherControlId);
    }
  }

  render() {
    const {
      controlsList,
      controls,
      sequencesList,
      onAddControl,
      onChangeControl,
      onDeleteControl,
    } = this.props;

    return (
      <Container>
        <PageTitleBar
          title="Controls"
          shortDescription="Controls are displayed on the listeners' devices so they can make choices that affect object allocation."
          helpId="controls"
        />
        { (controlsList.length > 0)
          ? (
            <Card.Group stackable doubling itemsPerRow={2}>
              { controlsList.map(({ controlId }, i) => (
                <ControlCard
                  key={controlId}
                  onDelete={() => onDeleteControl(controlId)}
                  onChange={(name, value) => onChangeControl(controlId, name, value)}
                  {...controls[controlId]}
                  sequencesList={sequencesList}
                  onMoveUp={i === 0 ? undefined : () => {
                    this.handleMoveControl(i, -1);
                  }}
                  onMoveDown={i === controlsList.length - 1 ? undefined : () => {
                    this.handleMoveControl(i, 1);
                  }}
                />
              ))}
              <Card key="add-control">
                <Card.Content>
                  <Segment placeholder textAlign="center">
                    <Header content="More controls" subheader="You can add as many controls as you need." />
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
          )}
      </Container>
    );
  }
}

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
  onSwapControlOrder: PropTypes.func.isRequired,
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
  onAddControl: (
    type,
    name,
    parameters,
    defaultValues,
  ) => dispatch(addControl(projectId, type, name, parameters, defaultValues)),
  onChangeControl: (
    controlId,
    name,
    value,
  ) => dispatch(replaceControlProperty(projectId, controlId, name, value)),
  onSwapControlOrder: (
    controlId,
    otherControlId,
  ) => dispatch(swapControlOrder(projectId, controlId, otherControlId)),
  onDeleteControl: (controlId) => dispatch(deleteControl(projectId, controlId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
