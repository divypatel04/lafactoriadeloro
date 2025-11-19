import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './PricingConfig.css';

const PricingConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('compositions');
  const [testCalc, setTestCalc] = useState({
    weight: 5,
    composition: '14K',
    material: 'yellow-gold',
    diamondType: 'none',
    diamondCarat: 0,
    ringSize: '7',
    result: null
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pricing-config');
      setConfig(response.data.data);
    } catch (error) {
      toast.error('Failed to load pricing configuration');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/pricing-config', config);
      toast.success('Pricing configuration saved successfully!');
    } catch (error) {
      toast.error('Failed to save pricing configuration');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestCalculation = async () => {
    try {
      const response = await api.post('/pricing-config/calculate', {
        weight: parseFloat(testCalc.weight),
        composition: testCalc.composition,
        material: testCalc.material,
        diamondType: testCalc.diamondType,
        diamondCarat: parseFloat(testCalc.diamondCarat),
        ringSize: testCalc.ringSize
      });
      setTestCalc({ ...testCalc, result: response.data.data.price });
      toast.success('Price calculated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to calculate price');
    }
  };

  const updateCompositionRate = (index, field, value) => {
    const updated = { ...config };
    updated.compositionRates[index][field] = value;
    setConfig(updated);
  };

  const updateMaterialMultiplier = (compIndex, matIndex, value) => {
    const updated = { ...config };
    updated.compositionRates[compIndex].materialTypes[matIndex].priceMultiplier = parseFloat(value);
    setConfig(updated);
  };

  const updateDiamondPricing = (index, field, value) => {
    const updated = { ...config };
    updated.diamondPricing[index][field] = value;
    setConfig(updated);
  };

  const updateAdditionalCost = (field, value) => {
    const updated = { ...config };
    updated.additionalCosts[field] = parseFloat(value);
    setConfig(updated);
  };

  const updateRingSizePricing = (field, value) => {
    const updated = { ...config };
    updated.ringSizePricing[field] = value;
    setConfig(updated);
  };

  const updateRingSizeAdjustment = (size, priceAdjustment) => {
    const updated = { ...config };
    const existingIndex = updated.ringSizePricing.sizeAdjustments.findIndex(s => s.size === size);
    
    if (existingIndex >= 0) {
      updated.ringSizePricing.sizeAdjustments[existingIndex].priceAdjustment = parseFloat(priceAdjustment) || 0;
    } else {
      updated.ringSizePricing.sizeAdjustments.push({
        size,
        priceAdjustment: parseFloat(priceAdjustment) || 0
      });
    }
    
    setConfig(updated);
  };

  const getRingSizePrice = (size) => {
    if (!config?.ringSizePricing?.sizeAdjustments) return 0;
    const adjustment = config.ringSizePricing.sizeAdjustments.find(s => s.size === size);
    return adjustment?.priceAdjustment || 0;
  };

  if (loading) {
    return (
      <div className="pricing-config-loading">
        <div className="spinner"></div>
        <p>Loading pricing configuration...</p>
      </div>
    );
  }

  if (!config) {
    return <div className="pricing-config-error">Failed to load configuration</div>;
  }

  return (
    <div className="pricing-config-container">
      <div className="pricing-config-header">
        <h1>💰 Pricing Configuration</h1>
        <p>Configure central pricing rules - all product prices are calculated automatically based on these settings</p>
        <button 
          className="btn btn-primary btn-save"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : '💾 Save Configuration'}
        </button>
      </div>

      <div className="pricing-config-tabs">
        <button 
          className={`tab ${activeTab === 'compositions' ? 'active' : ''}`}
          onClick={() => setActiveTab('compositions')}
        >
          🔷 Compositions
        </button>
        <button 
          className={`tab ${activeTab === 'diamonds' ? 'active' : ''}`}
          onClick={() => setActiveTab('diamonds')}
        >
          💎 Diamonds
        </button>
        <button 
          className={`tab ${activeTab === 'ring-sizes' ? 'active' : ''}`}
          onClick={() => setActiveTab('ring-sizes')}
        >
          💍 Ring Sizes
        </button>
        <button 
          className={`tab ${activeTab === 'costs' ? 'active' : ''}`}
          onClick={() => setActiveTab('costs')}
        >
          💵 Additional Costs
        </button>
        <button 
          className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          🧮 Price Calculator
        </button>
      </div>

      <div className="pricing-config-content">
        {/* COMPOSITIONS TAB */}
        {activeTab === 'compositions' && (
          <div className="tab-content">
            <h2>Metal Composition Pricing</h2>
            <p className="tab-description">
              Set the base price per gram for each metal composition. The final price is calculated as: 
              <strong> (Weight × Price Per Gram × Material Multiplier)</strong>
            </p>

            {config.compositionRates.map((comp, compIndex) => (
              <div key={comp.composition} className="composition-card">
                <div className="composition-header">
                  <h3>{comp.composition} - {comp.label}</h3>
                  <label className="toggle">
                    <input 
                      type="checkbox"
                      checked={comp.enabled}
                      onChange={(e) => updateCompositionRate(compIndex, 'enabled', e.target.checked)}
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Price Per Gram ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    value={comp.pricePerGram}
                    onChange={(e) => updateCompositionRate(compIndex, 'pricePerGram', parseFloat(e.target.value))}
                    className="form-control"
                  />
                  <small>Base price for 1 gram of {comp.composition}</small>
                </div>

                <h4>Material Type Multipliers</h4>
                <div className="materials-grid">
                  {comp.materialTypes.map((mat, matIndex) => (
                    <div key={mat.material} className="material-item">
                      <label>{mat.label}</label>
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        value={mat.priceMultiplier}
                        onChange={(e) => updateMaterialMultiplier(compIndex, matIndex, e.target.value)}
                        className="form-control"
                      />
                      <small>×{mat.priceMultiplier} multiplier</small>
                    </div>
                  ))}
                </div>

                <div className="calculation-example">
                  <strong>Example:</strong> 5g ring in {comp.composition} Yellow Gold = 
                  5g × ${comp.pricePerGram} × {comp.materialTypes.find(m => m.material === 'yellow-gold')?.priceMultiplier || 1} = 
                  <span className="price">${(5 * comp.pricePerGram * (comp.materialTypes.find(m => m.material === 'yellow-gold')?.priceMultiplier || 1)).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIAMONDS TAB */}
        {activeTab === 'diamonds' && (
          <div className="tab-content">
            <h2>Diamond Pricing</h2>
            <p className="tab-description">
              Configure additional pricing for diamond options. You can set either a fixed price or price per carat.
            </p>

            {config.diamondPricing.map((diamond, index) => (
              <div key={diamond.type} className="diamond-card">
                <div className="diamond-header">
                  <h3>💎 {diamond.label}</h3>
                  <label className="toggle">
                    <input 
                      type="checkbox"
                      checked={diamond.enabled}
                      onChange={(e) => updateDiamondPricing(index, 'enabled', e.target.checked)}
                    />
                    <span>Enabled</span>
                  </label>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fixed Price ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={diamond.fixedPrice}
                      onChange={(e) => updateDiamondPricing(index, 'fixedPrice', parseFloat(e.target.value))}
                      className="form-control"
                    />
                    <small>Flat addition to product price</small>
                  </div>

                  <div className="form-group">
                    <label>Price Per Carat ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      value={diamond.pricePerCarat}
                      onChange={(e) => updateDiamondPricing(index, 'pricePerCarat', parseFloat(e.target.value))}
                      className="form-control"
                    />
                    <small>Price × diamond carats</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* RING SIZES TAB */}
        {activeTab === 'ring-sizes' && (
          <div className="tab-content">
            <h2>Ring Size Price Adjustments</h2>
            <p className="tab-description">
              Set individual price adjustments for each ring size. Default is $0 (no extra charge). Add positive values for extra charges or negative values for discounts.
            </p>

            <div className="ring-size-card">
              <div className="ring-sizes-grid">
                {['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'].map(size => (
                  <div key={size} className="ring-size-item">
                    <label>Size {size}</label>
                    <div className="input-with-prefix">
                      <span className="prefix">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={getRingSizePrice(size)}
                        onChange={(e) => updateRingSizeAdjustment(size, e.target.value)}
                        className="form-control"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="info-box">
                <strong>💡 Tips:</strong>
                <ul>
                  <li>Use <strong>$0</strong> for no additional charge (default)</li>
                  <li>Use <strong>positive values</strong> (e.g., $50) to add extra charges for larger sizes</li>
                  <li>Use <strong>negative values</strong> (e.g., -$20) to offer discounts for smaller sizes</li>
                  <li>These adjustments will be added to the base product price</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ADDITIONAL COSTS TAB */}
        {activeTab === 'costs' && (
          <div className="tab-content">
            <h2>Additional Costs & Margins</h2>
            <p className="tab-description">
              Configure labor costs, profit margins, and minimum pricing.
            </p>

            <div className="costs-card">
              <h3>Labor Costs</h3>
              
              <div className="form-group">
                <label>Fixed Labor Cost ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.additionalCosts.laborCost}
                  onChange={(e) => updateAdditionalCost('laborCost', e.target.value)}
                  className="form-control"
                />
                <small>Added to every product regardless of weight</small>
              </div>

              <div className="form-group">
                <label>Labor Cost Per Gram ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.additionalCosts.laborCostPerGram}
                  onChange={(e) => updateAdditionalCost('laborCostPerGram', e.target.value)}
                  className="form-control"
                />
                <small>Multiplied by product weight and added to price</small>
              </div>
            </div>

            <div className="costs-card">
              <h3>Profit & Pricing</h3>
              
              <div className="form-group">
                <label>Profit Margin (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={config.additionalCosts.profitMarginPercentage}
                  onChange={(e) => updateAdditionalCost('profitMarginPercentage', e.target.value)}
                  className="form-control"
                />
                <small>Percentage added to total cost (0-100)</small>
              </div>

              <div className="form-group">
                <label>Minimum Product Price ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.additionalCosts.minimumPrice}
                  onChange={(e) => updateAdditionalCost('minimumPrice', e.target.value)}
                  className="form-control"
                />
                <small>No product will be priced below this amount</small>
              </div>
            </div>

            <div className="formula-display">
              <h3>Final Price Formula</h3>
              <div className="formula">
                <p><strong>Base Price</strong> = Weight × Composition Rate × Material Multiplier</p>
                <p><strong>+</strong> Diamond Price (Fixed or Per Carat)</p>
                <p><strong>+</strong> Ring Size Adjustment</p>
                <p><strong>+</strong> Fixed Labor Cost</p>
                <p><strong>+</strong> (Weight × Labor Cost Per Gram)</p>
                <p><strong>×</strong> (1 + Profit Margin %)</p>
                <p><strong>=</strong> Final Price (minimum: Minimum Product Price)</p>
              </div>
            </div>
          </div>
        )}

        {/* CALCULATOR TAB */}
        {activeTab === 'calculator' && (
          <div className="tab-content">
            <h2>Price Calculator</h2>
            <p className="tab-description">
              Test your pricing configuration by calculating the price for specific product specifications.
            </p>

            <div className="calculator-card">
              <div className="form-row">
                <div className="form-group">
                  <label>Weight (grams)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={testCalc.weight}
                    onChange={(e) => setTestCalc({ ...testCalc, weight: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Composition</label>
                  <select 
                    value={testCalc.composition}
                    onChange={(e) => setTestCalc({ ...testCalc, composition: e.target.value })}
                    className="form-control"
                  >
                    {config.compositionRates.filter(c => c.enabled).map(comp => (
                      <option key={comp.composition} value={comp.composition}>
                        {comp.composition} - {comp.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Material</label>
                  <select 
                    value={testCalc.material}
                    onChange={(e) => setTestCalc({ ...testCalc, material: e.target.value })}
                    className="form-control"
                  >
                    <option value="yellow-gold">Yellow Gold</option>
                    <option value="white-gold">White Gold</option>
                    <option value="rose-gold">Rose Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Diamond Type</label>
                  <select 
                    value={testCalc.diamondType}
                    onChange={(e) => setTestCalc({ ...testCalc, diamondType: e.target.value })}
                    className="form-control"
                  >
                    {config.diamondPricing.filter(d => d.enabled).map(diamond => (
                      <option key={diamond.type} value={diamond.type}>
                        {diamond.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Diamond Carat (if applicable)</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={testCalc.diamondCarat}
                    onChange={(e) => setTestCalc({ ...testCalc, diamondCarat: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label>Ring Size</label>
                  <select 
                    value={testCalc.ringSize}
                    onChange={(e) => setTestCalc({ ...testCalc, ringSize: e.target.value })}
                    className="form-control"
                  >
                    {['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'].map(size => (
                      <option key={size} value={size}>Size {size}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                className="btn btn-primary btn-calculate"
                onClick={handleTestCalculation}
              >
                🧮 Calculate Price
              </button>

              {testCalc.result !== null && (
                <div className="calculation-result">
                  <h3>Calculated Price</h3>
                  <div className="result-price">${testCalc.result.toFixed(2)}</div>
                  <div className="result-details">
                    <p>Weight: {testCalc.weight}g</p>
                    <p>Composition: {testCalc.composition}</p>
                    <p>Material: {testCalc.material}</p>
                    <p>Diamond: {testCalc.diamondType}</p>
                    {testCalc.diamondCarat > 0 && <p>Carat: {testCalc.diamondCarat}</p>}
                    <p>Ring Size: {testCalc.ringSize}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingConfig;
