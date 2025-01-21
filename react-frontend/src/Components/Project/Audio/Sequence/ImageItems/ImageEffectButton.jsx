import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './ImageEffectButton.css';

const effectShapes = {
  static: (
    <svg viewBox="0 0 100 100">
      <path d="M102.5,34.6634954 L102.5,102.5 L-2.5,102.5 L-2.5,34.6634954 L102.5,34.6634954 Z" />
    </svg>
  ),
  sine: (
    <svg viewBox="0 0 100 100">
      <path d="M80.9105735,12.5 L91.8424859,21.6814927 L102.5,36.3512381 L102.5,102.5 L-2.5,102.5 L-2.5,29.5742618 L11.8447517,48.9847151 L20.9297686,56.8269908 L29.1089701,56.8269908 L38.1599913,49.436381 L47.9715566,35.7021547 L58.1575141,21.6814927 L69.0894265,12.5 L80.9105735,12.5 Z" />
    </svg>
  ),
  breathe: (
    <svg viewBox="0 0 100 100">
      <path d="M75.9028705,4.62908274 L102.5,49.3122602 L102.5,102.5 L-2.5,102.5 L-2.5,48.5346902 L75.9028705,4.62908274 Z" />
    </svg>
  ),
  heartbeat: (
    <svg viewBox="0 0 100 100">
      <path d="M47.3995413,19.1438186 L55.3510974,72.1541924 L68.5,47.5 L102.5,47.5 L102.5,102.5 L-2.5,102.5 L-2.5,47.5 L9.04065999,47.5 L20.6662555,37.036964 L31.0376628,55.8042723 L37.7974541,48.6887025 L47.3995413,19.1438186 Z" />
    </svg>
  ),
};

function ImageEffectButton({
  src,
  title,
  loading,
  onClick,
  selected,
  large,
  effect,
}) {
  return (
    <button
      type="button"
      className={classnames(
        'bcob-image-effect-button',
        {
          selected,
          large,
        },
      )}
      disabled={loading}
      title={title}
      onClick={onClick}
    >
      {!loading && src && <img src={src} alt="" />}
      {effect && (
      <div
        className={classnames('effect', effect.name)}
        style={{ backgroundColor: effect.color }}
      >
        { effectShapes[effect.name] }
      </div>
      )}
    </button>
  );
}

ImageEffectButton.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  large: PropTypes.bool,
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

ImageEffectButton.defaultProps = {
  src: undefined,
  title: undefined,
  loading: false,
  onClick: undefined,
  selected: false,
  large: false,
  effect: undefined,
};

export default ImageEffectButton;
