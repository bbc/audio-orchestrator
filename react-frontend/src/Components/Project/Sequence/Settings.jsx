import React from 'react';
import { connect } from 'react-redux';
import {
  Segment,
  Header,
  Form,
} from 'semantic-ui-react';
import { setSequenceSetting } from '../../../actions/project';
import NextChoices from './NextChoices';

class Settings extends React.Component {
  constructor(props) {
    super(props);

    const { loop, skippable, onChangeSetting } = props;

    if (loop && !skippable) {
      this.handleChange('skippable', true);
    }

    this.handleChange = (name, value) => {
      onChangeSetting(name, value);

      // loop implies skippable; because otherwise the loop will be unescapable.
      if (name === 'loop' && value === true) {
        onChangeSetting('skippable', true);
      }
    };
  }

  render() {
    const {
      projectId,
      sequenceId,
      loop,
      skippable,
      hold,
      next,
      sequencesList,
    } = this.props;

    return (
      <Segment attached>
        <Header content="Behaviour" />

        <Form>
          <Form.Checkbox
            checked={loop}
            label={`Loop: the sequence ${loop ? 'repeats until the user makes a choice' : 'does not repeat'}.`}
            onChange={(e, { checked }) => this.handleChange('loop', checked)}
          />

          <Form.Checkbox
            checked={skippable}
            disabled={loop}
            label={`Skippable: the choices are ${skippable ? 'always displayed' : 'displayed only when the sequence has ended'}.`}
            onChange={(e, { checked }) => this.handleChange('skippable', checked)}
          />

          <Form.Checkbox
            checked={hold}
            disabled={loop}
            label={`Hold: the player ${hold ? 'waits for the user to make a choice' : 'automatically moves on'} when the sequence ends.`}
            onChange={(e, { checked }) => this.handleChange('hold', checked)}
          />
        </Form>

        <Header content="Choices" />
        <NextChoices
          value={next}
          sequencesList={sequencesList}
          onChange={(e, { value }) => this.handleChange('next', value)}
        />
      </Segment>
    );
  }
}

const mapStateToProps = (state, { projectId, sequenceId }) => {
  const { sequences, sequencesList } = state.Project.projects[projectId];
  const {
    loop,
    skippable,
    hold,
    next,
  } = sequences[sequenceId];

  return {
    loop,
    skippable,
    hold,
    next,
    sequencesList,
  };
};
const mapDispatchToProps = (dispatch, { projectId, sequenceId }) => ({
  onChangeSetting: (key, value) => dispatch(setSequenceSetting(projectId, sequenceId, key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
