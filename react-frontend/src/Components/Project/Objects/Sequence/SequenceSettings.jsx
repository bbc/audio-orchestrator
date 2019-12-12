import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Form,
  List,
} from 'semantic-ui-react';
import { setSequenceSetting } from '../../../../actions/project';

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
        onChangeSetting('hold', false);
      }
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
        <Form>
          <List relaxed>
            <List.Item>
              <List.Content as={Form.Field}>
                <List.Header>
                  <Form.Checkbox
                    checked={loop}
                    label="Loop"
                    onChange={(e, { checked }) => this.handleChange('loop', checked)}
                  />
                </List.Header>
                <List.Description content={`The sequence ${loop ? 'will repeat until the user makes a choice' : 'will not repeat'}.`} />
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content as={Form.Field} disabled={loop}>
                <List.Header>
                  <Form.Checkbox
                    checked={skippable}
                    label="Skippable"
                    onChange={(e, { checked }) => this.handleChange('skippable', checked)}
                  />
                </List.Header>
                <List.Description content={`The choices will ${skippable ? 'always be displayed' : 'only be shown when the sequence ends'}.`} />
              </List.Content>
            </List.Item>
            <List.Item>
              <List.Content as={Form.Field} disabled={loop}>
                <List.Header>
                  <Form.Checkbox
                    checked={hold}
                    label="Hold"
                    onChange={(e, { checked }) => this.handleChange('hold', checked)}
                  />
                </List.Header>
                <List.Description content={`The player will ${hold ? 'pause and wait for the user to make a choice' : 'automatically move on to the first choice'} when the sequence ends.`} />
              </List.Content>
            </List.Item>
          </List>
        </Form>
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
