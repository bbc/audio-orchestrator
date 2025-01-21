import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  Table,
  Label,
} from 'semantic-ui-react';
import ColorSelection from '#Components/Project/Appearance/ColorSelection.jsx';
import ImageEffectButton from './ImageEffectButton.jsx';

const effectTypes = [
  {
    name: 'static', hasColor: true,
  },
  {
    name: 'sine', hasColor: true, hasPeriod: true, hasRepeat: true,
  },
  {
    name: 'breathe', hasColor: true, hasPeriod: true, hasRepeat: true,
  },
  {
    name: 'heartbeat', hasColor: true, hasPeriod: true, hasRepeat: true,
  },
];

const defaultEffect = {
  name: undefined,
  color: '#ffffff',
  period: 1.0,
  repeat: 'infinite',
};

function EffectEditor({
  effect,
  onChange,
}) {
  const handleChange = (properties) => {
    onChange({
      ...(effect || defaultEffect),
      ...properties,
    });
  };

  const {
    name,
    color,
    period,
    repeat,
  } = (effect || defaultEffect);

  const { hasColor, hasPeriod, hasRepeat } = effectTypes
    .find(({ name: typeName }) => typeName === name) || {};

  return (
    <Table basic="very" collapsing>
      <Table.Body>
        <Table.Row>
          <Table.Cell content="Animation shape" />
          <Table.Cell>
            {effectTypes.map(({ name: typeName }) => (
              <ImageEffectButton
                key={typeName}
                selected={effect && typeName === name}
                onClick={() => handleChange({ name: typeName })}
                effect={{ name: typeName, color }}
                large
              />
            ))}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell content="Colour" />
          <Table.Cell>
            <ColorSelection
              value={color}
              onChange={(e, { value }) => handleChange({ color: value })}
              custom
              disabled={!hasColor}
            />
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell content="Animation period" />
          <Table.Cell>
            <Input
              disabled={!hasPeriod}
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={period}
              onChange={(e, { value }) => {
                const newPeriod = parseFloat(value);
                if (!Number.isNaN(newPeriod)) {
                  handleChange({ period: newPeriod });
                }
              }}
              className="inputSliderFix"
            />
            {hasPeriod && (
              <Label pointing="left" content={`${period.toFixed(1)} seconds`} />
            )}
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell content="Animation repetition" />
          <Table.Cell>
            <Input
              disabled={!hasRepeat}
              type="range"
              min="1"
              max="11"
              step="1"
              value={repeat === 'infinite' ? 11 : repeat}
              onChange={(e, { value }) => {
                const newRepeat = parseInt(value, 10);
                if (newRepeat === 11) {
                  handleChange({ repeat: 'infinite' });
                } else if (!Number.isNaN(newRepeat)) {
                  handleChange({ repeat: newRepeat });
                }
              }}
              className="inputSliderFix"
            />
            {hasRepeat && (
              <Label
                pointing="left"
                content={repeat === 'infinite' ? 'Forever' : `${repeat}×`}
              />
            )}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );
}

EffectEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  effect: PropTypes.shape({
    name: PropTypes.string,
    color: PropTypes.string,
    period: PropTypes.number,
    repeat: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  }),
};

EffectEditor.defaultProps = {
  effect: undefined,

};

export default EffectEditor;
