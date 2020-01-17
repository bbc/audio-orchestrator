import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Button,
  Popup,
} from 'semantic-ui-react';
import { setSequenceSetting } from '../../../actions/project';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    const { onChangeSetting } = props;

    // TODO: Currently don't check that looped sequences are skippable.
    // The user is warned in the popup text

    // if (loop && !skippable) {
    //   this.handleChange('skippable', true);
    // }

    this.handleChange = (name, value) => {
      onChangeSetting(name, value);

      // loop implies skippable; because otherwise the loop will be unescapable.
      // if (name === 'loop' && value === true) {
      //   onChangeSetting('skippable', true);
      //   onChangeSetting('hold', false);
      // }
    };
  }

  render() {
    const {
      loop,
      skippable,
      hold,
    } = this.props;

    return (
      <Container>
        <Button.Group>
          <Popup
            trigger={<Button toggle icon="sync alternate" active={loop} onClick={() => this.handleChange('loop', !loop)} />}
            position="bottom center"
            header="Loop"
            content={`The sequence ${loop ? `will repeat until the user makes a choice${skippable ? '' : '. Note: the sequence is currently not skippable. This means that there will be no way of ending the loop'}` : 'will not repeat'}.`}
          />
          <Popup
            trigger={<Button toggle icon="step forward" active={skippable} onClick={() => this.handleChange('skippable', !skippable)} />}
            position="bottom center"
            header="Skippable"
            content={`The choices will ${skippable ? 'always be displayed' : 'only be shown when the sequence ends'}.`}
          />
          <Popup
            trigger={<Button toggle icon="pause" active={hold} onClick={() => this.handleChange('hold', !hold)} />}
            position="bottom center"
            header="Hold"
            content={`The player will ${hold ? 'pause and wait for the user to make a choice' : `automatically ${loop ? 'loop' : 'move on to the first choice'}`} when the sequence ends.`}
          />
        </Button.Group>
      </Container>
    );
  }
}

Settings.propTypes = {
// projectId: PropTypes.string.isRequired,
// sequenceId: PropTypes.string.isRequired,
  loop: PropTypes.bool.isRequired,
  skippable: PropTypes.bool.isRequired,
  hold: PropTypes.bool.isRequired,
  onChangeSetting: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const { sequences, sequencesList } = state.Project.projects[projectId];
  const {
    loop,
    skippable,
    hold,
  } = sequences[sequenceId];

  return {
    loop,
    skippable,
    hold,
    sequencesList,
  };
};
const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onChangeSetting: (key, value) => dispatch(setSequenceSetting(projectId, sequenceId, key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
