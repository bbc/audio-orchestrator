import React from 'react';
import PropTypes from 'prop-types';
import './RangePreview.css';

function RangePreview({
  min,
  max,
  start,
  end,
}) {
  const valid = [min, max, start, end].every((d) => d !== undefined && !Number.isNaN(d));
  const width = (end - start) / (max - min);
  const left = (start - min) / (max - min);
  return (
    <div className="bcob-range-preview-container">
      {valid && (
      <div
        className="bcob-range-preview-inner"
        style={{
          width: `${width * 100}%`,
          left: `${left * 100}%`,
        }}
      />
      )}
    </div>
  );
}

RangePreview.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  start: PropTypes.number,
  end: PropTypes.number,
};

RangePreview.defaultProps = {
  min: undefined,
  max: undefined,
  start: undefined,
  end: undefined,
};

export default RangePreview;
