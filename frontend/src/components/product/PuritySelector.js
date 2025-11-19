import React from 'react';
import './PuritySelector.css';

const PuritySelector = ({ selected, onChange, availablePurities }) => {
  const purities = availablePurities || ['10K', '14K', '18K', '22K', '24K'];

  const purityInfo = {
    '10K': { label: '10K', desc: '41.7% Pure' },
    '14K': { label: '14K', desc: '58.5% Pure' },
    '18K': { label: '18K', desc: '75% Pure' },
    '22K': { label: '22K', desc: '91.7% Pure' },
    '24K': { label: '24K', desc: '99.9% Pure' }
  };

  return (
    <div className="purity-selector">
      <label className="purity-label">Purity:</label>
      <div className="purity-options">
        {purities.map((purity) => {
          const info = purityInfo[purity] || { label: purity, desc: '' };
          return (
            <button
              key={purity}
              type="button"
              className={`purity-option ${selected === purity ? 'selected' : ''}`}
              onClick={() => onChange(purity)}
              title={info.desc}
            >
              <span className="purity-value">{info.label}</span>
              {info.desc && <span className="purity-desc">{info.desc}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PuritySelector;
