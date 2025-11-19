import React from 'react';
import './ColorPicker.css';

const ColorPicker = ({ selected, onChange, availableColors }) => {
  const colorMap = {
    'rose-gold': {
      label: 'Rose Gold',
      gradient: 'linear-gradient(135deg, #ECC5B7 0%, #E5B5A7 50%, #D4A297 100%)',
      color: '#ECC5B7'
    },
    'white-gold': {
      label: 'White Gold',
      gradient: 'linear-gradient(135deg, #E8E8E8 0%, #D5D5D5 50%, #C0C0C0 100%)',
      color: '#E8E8E8'
    },
    'yellow-gold': {
      label: 'Yellow Gold',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #F5C542 50%, #E5B732 100%)',
      color: '#FFD700'
    },
    'silver': {
      label: 'Silver',
      gradient: 'linear-gradient(135deg, #C0C0C0 0%, #B0B0B0 50%, #A0A0A0 100%)',
      color: '#C0C0C0'
    },
    'platinum': {
      label: 'Platinum',
      gradient: 'linear-gradient(135deg, #E5E4E2 0%, #D3D3D3 50%, #C0C0C0 100%)',
      color: '#E5E4E2'
    }
  };

  const colors = availableColors || ['rose-gold', 'white-gold', 'yellow-gold'];

  return (
    <div className="color-picker">
      <label className="color-picker-label">Color:</label>
      <div className="color-options">
        {colors.map((color) => {
          const colorData = colorMap[color];
          if (!colorData) return null;

          return (
            <div
              key={color}
              className={`color-swatch ${selected === color ? 'selected' : ''}`}
              onClick={() => onChange(color)}
              title={colorData.label}
            >
              <div
                className="color-circle"
                style={{ background: colorData.gradient }}
              />
              {selected === color && <div className="selection-ring" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ColorPicker;
