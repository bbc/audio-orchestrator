import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Container,
  Checkbox,
  List,
} from 'semantic-ui-react';
import { setSequenceSetting } from '../../../actions/project';

class SequenceSettingsNew extends React.Component {
  constructor(props) {
    super(props);

    const {
      onChangeSetting,
      loop,
      skippable,
    } = props;

    this.handleChange = (name, value) => {
      onChangeSetting(name, value);
      // loop implies skippable; because otherwise the loop will be unescapable.
      // loop implies no hold
      if (name === 'loop' && value === true) {
        onChangeSetting('skippable', true);
        onChangeSetting('hold', false);
      }
    };

    if (loop && !skippable) {
      this.handleChange('skippable', true);
    }
  }

  render() {
    const {
      loop,
      skippable,
      hold,
    } = this.props;

    return (
      <Container>
        <List>
          <List.Item>
            <Checkbox
              label="Loop this sequence"
              checked={loop}
              onChange={() => this.handleChange('loop', !loop)}
            />
          </List.Item>
          <List.Item>
            <Checkbox
              label="Destination buttons always visible"
              checked={skippable}
              onChange={() => this.handleChange('skippable', !skippable)}
              disabled={loop}
            />
          </List.Item>
          <List.Item>
            <Checkbox
              label="Wait for user to choose a destination at end of sequence"
              checked={hold}
              onChange={() => this.handleChange('hold', !hold)}
              disabled={loop}
            />
          </List.Item>
        </List>
      </Container>
    );
  }
}

SequenceSettingsNew.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SequenceSettingsNew);
