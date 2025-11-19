import React from 'react';
import './DiamondTypeSelector.css';

const DiamondTypeSelector = ({ selected, onChange }) => {
  const types = [
    { value: 'natural', label: 'Natural Diamond', icon: '💎' },
    { value: 'lab-grown', label: 'Lab-Grown Diamond', icon: '🔬' }
  ];

  return (
    <div className="diamond-type-selector">
      <label className="diamond-type-label">Diamond Type:</label>
      <div className="diamond-type-options">
        {types.map((type) => (
          <button
            key={type.value}
            type="button"
            className={`diamond-type-option ${selected === type.value ? 'selected' : ''}`}
            onClick={() => onChange(type.value)}
          >
            <span className="diamond-icon">{type.icon}</span>
            <span className="diamond-label">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DiamondTypeSelector;
