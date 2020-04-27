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
      panning,
      onChange,
      objectNumber,
    } = this.props;

    const generateLabel = (panValue) => {
      if (panValue === 0) {
        return 'Centre';
      }
      return `${Math.abs(panValue * 100).toFixed(0)}% ${panValue < 0 ? 'L' : 'R'}`;
    };

    return (
      <Popup
        trigger={(
          <Button
            compact
            size="mini"
            content={generateLabel(panning)}
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
          />
        </Container>
      </Popup>
    );
  }
}

PanningControl.propTypes = {
  panning: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  objectNumber: PropTypes.number.isRequired,
};

export default PanningControl;
