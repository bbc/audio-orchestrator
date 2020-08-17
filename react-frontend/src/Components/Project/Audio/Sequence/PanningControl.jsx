import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Container,
  Popup,
  Button,
  Grid,
} from 'semantic-ui-react';

class PanningControl extends React.PureComponent {
  render() {
    const {
      channelMapping,
      panning,
      onChange,
      objectNumber,
    } = this.props;

    let label;
    let disabled = false;
    if (channelMapping === 'stereo') {
      label = 'Stereo';
      disabled = true;
    } else if (panning === 0) {
      label = 'Centre';
    } else {
      label = `${Math.abs(panning * 100).toFixed(0)}% ${panning < 0 ? 'L' : 'R'}`;
    }

    return (
      <Popup
        trigger={(
          <Button
            disabled={disabled}
            compact
            size="tiny"
            content={label}
          />
        )}
        hoverable
        on="click"
        flowing
      >
        <Container fluid>
          <Grid columns="equal">
            <Grid.Column>
              <Button
                compact
                size="mini"
                content="L"
                onClick={() => onChange(objectNumber, -1)}
              />
            </Grid.Column>

            <Grid.Column>
              <Button
                compact
                size="mini"
                content="C"
                onClick={() => onChange(objectNumber, 0)}
              />
            </Grid.Column>

            <Grid.Column>
              <Button
                compact
                size="mini"
                content="R"
                onClick={() => onChange(objectNumber, 1)}
              />
            </Grid.Column>
          </Grid>

          <Input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={panning}
            onChange={(e, { value }) => onChange(objectNumber, Number(value))}
            className="inputSliderFix"
            style={{ width: '100%' }}
          />
        </Container>
      </Popup>
    );
  }
}

PanningControl.propTypes = {
  channelMapping: PropTypes.string.isRequired,
  panning: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  objectNumber: PropTypes.number.isRequired,
};

export default PanningControl;
