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
import InlineHelpPopup from 'Components/InlineHelpPopup';
import EditableText from '../EditableText';
import SequenceSettings from './SequenceSettings';
import SequenceChoices from './SequenceChoices';
import {
  setSequenceSetting,
  requestSetIntroSequence,
} from '../../../actions/project';

// TODO: The EditableText is very large when it's clicked
// NOTE: Must not allow deleting the initial sequence; or edit lib/Project to assign a new initial
// sequence if it is, because the project cannot be exported without an initial sequence.
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
      onSetIntro,
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
            <InlineHelpPopup
              content={isIntro
                ? 'Use as entry point (select this option on another sequence to change which sequence plays when the experience starts).'
                : 'Use as entry point (select this option to play this sequence when the experience starts).'
              }
              className="ui buttons"
            >
              <Button
                compact
                disabled={isIntro}
                icon={isIntro ? 'circle dot' : 'circle outline'}
                onClick={() => onSetIntro(sequenceId)}
              />
            </InlineHelpPopup>
            <InlineHelpPopup
              content="Edit the audio objects for this sequence."
              className="ui buttons"
            >
              <Button
                compact
                icon="file audio outline"
                onClick={() => onOpen(sequenceId)}
              />
            </InlineHelpPopup>
            <InlineHelpPopup
              content={isIntro ? 'The entry point sequence cannot be deleted.' : 'Delete this sequence.'}
              className="ui buttons"
            >
              <ConfirmDeleteButton
                small
                disabled={isIntro}
                type="sequence"
                name={name}
                notBasic
                onDelete={() => onDelete(sequenceId)}
              />
            </InlineHelpPopup>
          </Button.Group>
          <Card.Header>
            <EditableText
              value={name}
              name="controlName"
              onChange={onSetName}
            />
          </Card.Header>
          { isIntro ? <Card.Meta content="This sequence is the entry point." /> : <br /> }
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
              <Card.Meta content="Settings determine how and when the user can move between sequences." />
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
  onSetIntro: PropTypes.func.isRequired,
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
  onSetIntro: () => dispatch(requestSetIntroSequence(projectId, sequenceId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SequenceItem);
