import React from 'react';
import './RingSizeSelector.css';

const RingSizeSelector = ({ selected, onChange, availableSizes }) => {
  const allSizes = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
  
  const sizes = availableSizes && availableSizes.length > 0 ? availableSizes : allSizes;

  return (
    <div className="ring-size-selector">
      <label className="ring-size-label">Ring Size:</label>
      <div className="ring-size-options">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={`ring-size-option ${selected === size ? 'selected' : ''}`}
            onClick={() => onChange(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RingSizeSelector;
