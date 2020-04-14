import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Card,
  Button,
  Accordion,
  Icon,
  Divider,
} from 'semantic-ui-react';
import ConfirmDeleteButton from 'Components/ConfirmDeleteButton';
import EditableText from '../EditableText';
import SequenceSettings from './SequenceSettings';
import SequenceChoices from './SequenceChoices';
// import SequenceMenu from './SequenceMenu';
import { setSequenceSetting } from '../../../actions/project';


// TODO: The EditableText is very large when it's clicked
class SequenceItem extends React.Component {
  constructor(props) {
    super(props);

    const {
      onChangeSetting,
    } = props;

    this.handleChange = (name, value) => {
      onChangeSetting(name, value);
    };
  }

  render() {
    const {
      name,
      onOpen,
      onDelete,
      sequenceId,
      projectId,
      isIntro,
      onSetName,
      next,
      choicesOpen,
      settingsOpen,
    } = this.props;

    return (
      <Card>
        <Card.Content style={{ flexGrow: 0 }}>
          <Button.Group floated="right" basic size="tiny">
            <Button
              compact
              icon="file audio outline"
              onClick={() => {
                onOpen(sequenceId);
              }}
            />
            <ConfirmDeleteButton
              small
              disabled={isIntro}
              type="sequence"
              name={name}
              onDelete={() => onDelete(sequenceId)}
            />
          </Button.Group>
          <Card.Header>
            <EditableText
              value={name}
              name="controlName"
              onChange={onSetName}
            />
          </Card.Header>
          { isIntro ? <Card.Meta content="The experience starts here." /> : <br /> }
        </Card.Content>

        <Card.Content>
          <Accordion fluid>
            <Accordion.Title
              active={choicesOpen}
              onClick={() => this.handleChange('choicesOpen', !choicesOpen)}
            >
              <Icon name="dropdown" />
              <b>
                {`Sequence destinations (${next.length})`}
              </b>
            </Accordion.Title>
            <Accordion.Content active={choicesOpen}>
              <Card.Meta content="Destinations determine how the user can navigate between sequences using buttons on the main device." />
              <SequenceChoices sequenceId={sequenceId} projectId={projectId} />
            </Accordion.Content>
          </Accordion>

          <Divider />

          <Accordion fluid>
            <Accordion.Title
              active={settingsOpen}
              onClick={() => this.handleChange('settingsOpen', !settingsOpen)}
            >
              <Icon name="dropdown" />
              <b>
                Sequence settings
              </b>
            </Accordion.Title>
            <Accordion.Content active={settingsOpen}>
              <Card.Meta content="Settings determine how and when the user can interact with the choices." />
              <br />
              <SequenceSettings sequenceId={sequenceId} projectId={projectId} />
            </Accordion.Content>
          </Accordion>

        </Card.Content>
      </Card>
    );
  }
}

SequenceItem.propTypes = {
  onChangeSetting: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  onOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  sequenceId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  isIntro: PropTypes.bool,
  onSetName: PropTypes.func.isRequired,
  next: PropTypes.arrayOf(PropTypes.shape({
    choiceId: PropTypes.string,
    sequenceId: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
  choicesOpen: PropTypes.bool.isRequired,
  settingsOpen: PropTypes.bool.isRequired,
};

SequenceItem.defaultProps = {
  isIntro: false,
};

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const { sequences } = state.Project.projects[projectId];
  const { next, choicesOpen, settingsOpen } = sequences[sequenceId];

  return {
    next,
    choicesOpen,
    settingsOpen,
  };
};

const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onSetName: name => dispatch(setSequenceSetting(projectId, sequenceId, 'name', name)),
  onChangeSetting: (key, value) => dispatch(setSequenceSetting(projectId, sequenceId, key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceItem);
