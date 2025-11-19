import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './PricingConfigNew.css';

const PricingConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Test calculator state
  const [calculator, setCalculator] = useState({
    weight: 5,
    composition: '14K',
    material: 'yellow-gold',
    diamondType: 'none',
    diamondCarat: 0,
    ringSize: '7',
    calculating: false,
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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/pricing-config', config);
      toast.success('✓ Pricing saved successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const calculatePrice = async () => {
    try {
      setCalculator({ ...calculator, calculating: true });
      const response = await api.post('/pricing-config/calculate', {
        weight: parseFloat(calculator.weight),
        composition: calculator.composition,
        material: calculator.material,
        diamondType: calculator.diamondType,
        diamondCarat: parseFloat(calculator.diamondCarat),
        ringSize: calculator.ringSize
      });
      setCalculator({ ...calculator, calculating: false, result: response.data.data });
      toast.success('✓ Price calculated!');
    } catch (error) {
      setCalculator({ ...calculator, calculating: false });
      toast.error('Calculation failed');
    }
  };

  const updateConfig = (path, value) => {
    const updated = { ...config };
    const keys = path.split('.');
    let current = updated;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setConfig(updated);
  };

  const updateRingSizeAdjustment = (size, percentageAdjustment) => {
    const updated = { ...config };
    if (!updated.ringSizePricing.sizeAdjustments) {
      updated.ringSizePricing.sizeAdjustments = [];
    }
    
    const existingIndex = updated.ringSizePricing.sizeAdjustments.findIndex(s => s.size === size);
    
    if (existingIndex >= 0) {
      updated.ringSizePricing.sizeAdjustments[existingIndex].percentageAdjustment = parseFloat(percentageAdjustment) || 0;
    } else {
      updated.ringSizePricing.sizeAdjustments.push({
        size,
        percentageAdjustment: parseFloat(percentageAdjustment) || 0
      });
    }
    
    setConfig(updated);
  };

  const getRingSizePercentage = (size) => {
    if (!config?.ringSizePricing?.sizeAdjustments) return 0;
    const adjustment = config.ringSizePricing.sizeAdjustments.find(s => s.size === size);
    return adjustment?.percentageAdjustment || 0;
  };

  if (loading) {
    return (
      <div className="pricing-loading">
        <div className="loading-spinner"></div>
        <p>Loading pricing configuration...</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="pricing-error">
        <h2>⚠️ Configuration Error</h2>
        <p>Unable to load pricing configuration</p>
        <button onClick={fetchConfig} className="btn-retry">Retry</button>
      </div>
    );
  }

  return (
    <div className="pricing-config-new">
      {/* Header */}
      <div className="pricing-header">
        <div className="header-content">
          <h1>💰 Pricing Configuration</h1>
          <p className="subtitle">Manage your jewelry pricing rules and calculations</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-save"
        >
          {saving ? '⏳ Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="pricing-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'metals' ? 'active' : ''}`}
          onClick={() => setActiveTab('metals')}
        >
          <span className="tab-icon">🥇</span>
          Metal Pricing
        </button>
        <button
          className={`tab ${activeTab === 'diamonds' ? 'active' : ''}`}
          onClick={() => setActiveTab('diamonds')}
        >
          <span className="tab-icon">💎</span>
          Diamonds
        </button>
        <button
          className={`tab ${activeTab === 'sizing' ? 'active' : ''}`}
          onClick={() => setActiveTab('sizing')}
        >
          <span className="tab-icon">📏</span>
          Ring Sizes
        </button>
        <button
          className={`tab ${activeTab === 'costs' ? 'active' : ''}`}
          onClick={() => setActiveTab('costs')}
        >
          <span className="tab-icon">💵</span>
          Additional Costs
        </button>
        <button
          className={`tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <span className="tab-icon">🧮</span>
          Price Calculator
        </button>
      </div>

      {/* Tab Content */}
      <div className="pricing-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="overview-grid">
              <div className="overview-card">
                <div className="card-icon">🥇</div>
                <h3>Metal Compositions</h3>
                <p className="card-value">{config.compositionRates?.length || 0}</p>
                <p className="card-desc">Different gold/silver types configured</p>
                <button onClick={() => setActiveTab('metals')} className="card-link">
                  Configure →
                </button>
              </div>

              <div className="overview-card">
                <div className="card-icon">💎</div>
                <h3>Diamond Types</h3>
                <p className="card-value">{config.diamondPricing?.length || 0}</p>
                <p className="card-desc">Diamond pricing options available</p>
                <button onClick={() => setActiveTab('diamonds')} className="card-link">
                  Configure →
                </button>
              </div>

              <div className="overview-card">
                <div className="card-icon">📏</div>
                <h3>Ring Sizes</h3>
                <p className="card-value">
                  {config.ringSizePricing?.sizeAdjustments?.length || 17} sizes
                </p>
                <p className="card-desc">Percentage-based adjustments (default 0%)</p>
                <button onClick={() => setActiveTab('sizing')} className="card-link">
                  Configure →
                </button>
              </div>

              <div className="overview-card">
                <div className="card-icon">💰</div>
                <h3>Profit Margin</h3>
                <p className="card-value">{config.additionalCosts?.profitMarginPercentage || 0}%</p>
                <p className="card-desc">Current markup percentage</p>
                <button onClick={() => setActiveTab('costs')} className="card-link">
                  Configure →
                </button>
              </div>
            </div>

            <div className="quick-start-guide">
              <h3>🚀 Quick Start Guide</h3>
              <div className="guide-steps">
                <div className="guide-step">
                  <span className="guide-number">1️⃣</span>
                  <div>
                    <h4>Set Metal Prices</h4>
                    <p>Go to "Metal Pricing" and enter how much you pay per gram for each gold type (10K, 14K, 18K, etc.)</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="guide-number">2️⃣</span>
                  <div>
                    <h4>Add Your Costs</h4>
                    <p>In "Additional Costs", enter your labor charges, making fees, and desired profit margin</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="guide-number">3️⃣</span>
                  <div>
                    <h4>Test the Calculator</h4>
                    <p>Use the "Price Calculator" to see real prices and make sure everything looks right</p>
                  </div>
                </div>
                <div className="guide-step">
                  <span className="guide-number">4️⃣</span>
                  <div>
                    <h4>Save & Go Live</h4>
                    <p>Click "Save Changes" and your new prices will apply to all products automatically</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="formula-explanation">
              <h3>💡 How Your Prices Are Calculated</h3>
              <p className="formula-intro">
                Don't worry about the math - the system does it automatically! Here's what happens when a customer buys a ring:
              </p>
              <div className="formula-box">
                <div className="formula-step">
                  <span className="step-num">1</span>
                  <div className="step-content">
                    <h4>💰 Material Cost</h4>
                    <p className="simple-explanation">
                      How much the gold or silver costs based on weight
                    </p>
                    <p className="formula">Ring Weight × Your Metal Price × Material Type</p>
                    <div className="example-box">
                      <span className="example-label">Real Example:</span>
                      <p className="example">5 grams × $50/gram × 1.1 (white gold) = <strong>$275</strong></p>
                      <p className="example-note">💡 White gold costs a bit more because of the rhodium plating</p>
                    </div>
                  </div>
                </div>

                <div className="formula-step">
                  <span className="step-num">2</span>
                  <div className="step-content">
                    <h4>💎 Diamond Cost (if any)</h4>
                    <p className="simple-explanation">
                      The price of diamonds added to the ring
                    </p>
                    <p className="formula">Base Diamond Price + (Carat Size × Per-Carat Price)</p>
                    <div className="example-box">
                      <span className="example-label">Real Example:</span>
                      <p className="example">$100 base + (0.5 carats × $200/carat) = <strong>$200</strong></p>
                      <p className="example-note">💡 Larger diamonds cost more per carat</p>
                    </div>
                  </div>
                </div>

                <div className="formula-step">
                  <span className="step-num">3</span>
                  <div className="step-content">
                    <h4>🔨 Your Costs</h4>
                    <p className="simple-explanation">
                      Your labor, crafting fees, and any size adjustments
                    </p>
                    <p className="formula">Labor + Making Charges + Ring Size Fee + Other Costs</p>
                    <div className="example-box">
                      <span className="example-label">Real Example:</span>
                      <p className="example">$50 labor + $30 making + $10 size + $10 other = <strong>$100</strong></p>
                      <p className="example-note">💡 These cover your time and expertise</p>
                    </div>
                  </div>
                </div>

                <div className="formula-step">
                  <span className="step-num">4</span>
                  <div className="step-content">
                    <h4>✅ Final Selling Price</h4>
                    <p className="simple-explanation">
                      Everything added up, plus your profit margin
                    </p>
                    <p className="formula">Total Costs × (1 + Your Profit %)</p>
                    <div className="example-box final">
                      <span className="example-label">Real Example:</span>
                      <p className="example">
                        $575 (material + diamond + costs) × 1.30 (30% profit) = <strong className="final-price">$747.50</strong>
                      </p>
                      <p className="example-note profit">✨ This is what the customer pays - you make $172.50 profit!</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pricing-summary">
                <h4>📊 In This Example:</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-icon">💰</span>
                    <div>
                      <strong>Your Total Cost</strong>
                      <p>$575.00</p>
                    </div>
                  </div>
                  <div className="summary-item">
                    <span className="summary-icon">💵</span>
                    <div>
                      <strong>Customer Pays</strong>
                      <p>$747.50</p>
                    </div>
                  </div>
                  <div className="summary-item profit">
                    <span className="summary-icon">✨</span>
                    <div>
                      <strong>Your Profit</strong>
                      <p>$172.50 (30%)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="help-tips">
              <h3>💭 Common Questions</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <h4>❓ What profit margin should I use?</h4>
                  <p>Most jewelry stores use 25-40%. Start with 30% and adjust based on your market.</p>
                </div>
                <div className="tip-card">
                  <h4>❓ How often should I update prices?</h4>
                  <p>Update metal prices weekly or when gold prices change significantly (±5%).</p>
                </div>
                <div className="tip-card">
                  <h4>❓ What if I make a mistake?</h4>
                  <p>No worries! Just fix the number and click Save. Changes apply instantly to all products.</p>
                </div>
                <div className="tip-card">
                  <h4>❓ Can I test before going live?</h4>
                  <p>Yes! Use the Price Calculator to test different combinations before saving.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metal Pricing Tab */}
        {activeTab === 'metals' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>🥇 Metal Pricing - Set Your Gold & Silver Prices</h2>
              <p>Enter how much you pay per gram for each metal. We'll automatically calculate customer prices.</p>
            </div>

            <div className="help-banner">
              <span className="help-icon">💡</span>
              <div className="help-content">
                <strong>Quick Tip:</strong> Check current gold prices at Kitco.com or your supplier. 
                The "Price Multiplier" (like 1.1 for white gold) covers extra costs like rhodium plating.
              </div>
            </div>

            <div className="metals-grid">
              {config.compositionRates?.map((comp, index) => (
                <div key={index} className="metal-card">
                  <div className="metal-header">
                    <h3>{comp.label || comp.composition}</h3>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={comp.enabled !== false}
                        onChange={(e) => updateConfig(
                          `compositionRates.${index}.enabled`,
                          e.target.checked
                        )}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="metal-content">
                    <div className="input-group">
                      <label>Price per Gram</label>
                      <div className="input-with-icon">
                        <span className="input-icon">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={comp.pricePerGram}
                          onChange={(e) => updateConfig(
                            `compositionRates.${index}.pricePerGram`,
                            parseFloat(e.target.value)
                          )}
                          disabled={comp.enabled === false}
                        />
                      </div>
                    </div>

                    <div className="material-types">
                      <label>Material Finishes (Extra Cost Multipliers)</label>
                      <p className="helper-text">
                        1.0 = no extra cost | 1.1 = 10% more | 1.2 = 20% more
                      </p>
                      {comp.materialTypes?.map((mat, matIndex) => (
                        <div key={matIndex} className="material-row">
                          <span className="material-name">
                            {mat.label || mat.material}
                            {(mat.label === 'White Gold' || mat.material === 'white-gold') && <span className="info-badge">needs plating</span>}
                            {(mat.label === 'Rose Gold' || mat.material === 'rose-gold') && <span className="info-badge">copper alloy</span>}
                          </span>
                          <div className="material-input">
                            <span className="multiplier-label">×</span>
                            <input
                              type="number"
                              step="0.1"
                              value={mat.priceMultiplier}
                              onChange={(e) => updateConfig(
                                `compositionRates.${index}.materialTypes.${matIndex}.priceMultiplier`,
                                parseFloat(e.target.value)
                              )}
                              disabled={comp.enabled === false}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="metal-example">
                      <div className="example-calculation">
                        <strong>💰 Price Examples:</strong>
                        <div className="calc-row">
                          <span>Small ring (3g):</span>
                          <span>${(3 * comp.pricePerGram).toFixed(2)}</span>
                        </div>
                        <div className="calc-row">
                          <span>Medium ring (5g):</span>
                          <span>${(5 * comp.pricePerGram).toFixed(2)}</span>
                        </div>
                        <div className="calc-row">
                          <span>Large ring (7g):</span>
                          <span>${(7 * comp.pricePerGram).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diamonds Tab */}
        {activeTab === 'diamonds' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>💎 Diamond Pricing - Simple & Clear</h2>
              <p>Set prices for different diamond qualities. Choose between fixed prices or per-carat pricing.</p>
            </div>

            <div className="help-banner">
              <span className="help-icon">💡</span>
              <div className="help-content">
                <strong>Two pricing methods:</strong><br/>
                • <strong>Fixed Price:</strong> Same price regardless of size (good for small accent diamonds)<br/>
                • <strong>Per Carat:</strong> Price increases with size (better for center stones)
              </div>
            </div>

            <div className="diamonds-grid">
              {config.diamondPricing?.map((diamond, index) => (
                <div key={index} className="diamond-card">
                  <div className="diamond-header">
                    <h3>{diamond.label || diamond.type}</h3>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={diamond.enabled !== false}
                        onChange={(e) => updateConfig(
                          `diamondPricing.${index}.enabled`,
                          e.target.checked
                        )}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="diamond-content">
                    <div className="pricing-method">
                      <label>Pricing Method</label>
                      <select
                        value={diamond.pricingMethod}
                        onChange={(e) => updateConfig(
                          `diamondPricing.${index}.pricingMethod`,
                          e.target.value
                        )}
                        disabled={diamond.enabled === false}
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="per-carat">Per Carat</option>
                      </select>
                    </div>

                    {diamond.pricingMethod === 'fixed' ? (
                      <div className="input-group">
                        <label>Fixed Price</label>
                        <div className="input-with-icon">
                          <span className="input-icon">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={diamond.basePrice}
                            onChange={(e) => updateConfig(
                              `diamondPricing.${index}.basePrice`,
                              parseFloat(e.target.value)
                            )}
                            disabled={diamond.enabled === false}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="input-row">
                        <div className="input-group">
                          <label>Base Price</label>
                          <div className="input-with-icon">
                            <span className="input-icon">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={diamond.basePrice}
                              onChange={(e) => updateConfig(
                                `diamondPricing.${index}.basePrice`,
                                parseFloat(e.target.value)
                              )}
                              disabled={diamond.enabled === false}
                            />
                          </div>
                        </div>
                        <div className="input-group">
                          <label>Price per Carat</label>
                          <div className="input-with-icon">
                            <span className="input-icon">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={diamond.pricePerCarat}
                              onChange={(e) => updateConfig(
                                `diamondPricing.${index}.pricePerCarat`,
                                parseFloat(e.target.value)
                              )}
                              disabled={diamond.enabled === false}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="diamond-example">
                      <strong>💰 What Customers Pay:</strong>
                      {diamond.pricingMethod === 'per-carat' ? (
                        <div className="example-calculation">
                          <div className="calc-row">
                            <span>0.25 carat diamond:</span>
                            <span>${((diamond.basePrice || 0) + (0.25 * (diamond.pricePerCarat || 0))).toFixed(2)}</span>
                          </div>
                          <div className="calc-row">
                            <span>0.50 carat diamond:</span>
                            <span>${((diamond.basePrice || 0) + (0.5 * (diamond.pricePerCarat || 0))).toFixed(2)}</span>
                          </div>
                          <div className="calc-row">
                            <span>1.00 carat diamond:</span>
                            <span>${((diamond.basePrice || 0) + (1.0 * (diamond.pricePerCarat || 0))).toFixed(2)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="example-calculation">
                          <div className="calc-row">
                            <span>Any size diamond:</span>
                            <span>${(diamond.basePrice || 0).toFixed(2)}</span>
                          </div>
                          <p className="helper-text">💡 Same price whether 0.25ct or 1.00ct</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ring Sizing Tab */}
        {activeTab === 'sizing' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>📏 Ring Size Price Adjustments</h2>
              <p>Set percentage-based price adjustments for each ring size. Default is 0% (no extra charge).</p>
            </div>

            <div className="sizing-container">
              <div className="help-banner">
                <span className="help-icon">💡</span>
                <div className="help-content">
                  <strong>How it works:</strong>
                  <ul>
                    <li>Use <strong>0%</strong> for no additional charge (default)</li>
                    <li>Use <strong>positive values</strong> (e.g., 10%) to add extra charges for larger sizes</li>
                    <li>Use <strong>negative values</strong> (e.g., -5%) to offer discounts for smaller sizes</li>
                    <li>Percentage is calculated from the base product price</li>
                    <li><strong>Example:</strong> If product is $1000 and size 10 has +10%, final price = $1100</li>
                  </ul>
                </div>
              </div>

              <div className="ring-sizes-modern-grid">
                {['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'].map(size => {
                  const percentage = getRingSizePercentage(size);
                  return (
                    <div key={size} className="ring-size-card-modern">
                      <div className="size-badge">
                        <span className="size-number">{size}</span>
                      </div>
                      <div className="percentage-input-wrapper">
                        <input
                          type="number"
                          step="0.5"
                          value={percentage}
                          onChange={(e) => updateRingSizeAdjustment(size, e.target.value)}
                          className="percentage-input"
                        />
                        <span className="percentage-symbol">%</span>
                      </div>
                      {percentage != 0 && (
                        <div className={`adjustment-indicator ${percentage > 0 ? 'positive' : 'negative'}`}>
                          {percentage > 0 ? '+' : ''}{percentage}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Additional Costs Tab */}
        {activeTab === 'costs' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>💵 Your Costs & Profit - The Most Important Page!</h2>
              <p>This is where you set your profit margin and add your labor/making costs</p>
            </div>

            <div className="help-banner important">
              <span className="help-icon">⭐</span>
              <div className="help-content">
                <strong>Your Profit Margin is KEY!</strong> This is YOUR earnings percentage on every sale. 
                Most jewelry stores use 25-40%. If you're new, start with 30% and adjust as you learn your market.
              </div>
            </div>

            <div className="costs-grid">
              <div className="cost-card">
                <div className="cost-icon">👨‍🔧</div>
                <h3>Labor Cost</h3>
                <p>Your time to design, cast, polish, set stones</p>
                <p className="helper-text-small">💡 Typical range: $30-$80 per piece</p>
                <div className="input-with-icon large">
                  <span className="input-icon">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={config.additionalCosts?.laborCost || 0}
                    onChange={(e) => updateConfig(
                      'additionalCosts.laborCost',
                      parseFloat(e.target.value)
                    )}
                  />
                </div>
              </div>

              <div className="cost-card">
                <div className="cost-icon">🔨</div>
                <h3>Making Charges</h3>
                <p>Equipment, tools, workshop costs, utilities</p>
                <p className="helper-text-small">💡 Typical range: $20-$50 per piece</p>
                <div className="input-with-icon large">
                  <span className="input-icon">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={config.additionalCosts?.makingCharges || 0}
                    onChange={(e) => updateConfig(
                      'additionalCosts.makingCharges',
                      parseFloat(e.target.value)
                    )}
                  />
                </div>
              </div>

              <div className="cost-card highlight">
                <div className="cost-icon">💰</div>
                <h3>Profit Margin ⭐</h3>
                <p>YOUR EARNINGS - This is how much you make!</p>
                <p className="helper-text-small">💡 25% = $25 per $100 | 30% = $30 per $100</p>
                <div className="input-with-icon large">
                  <span className="input-icon">%</span>
                  <input
                    type="number"
                    step="1"
                    value={config.additionalCosts?.profitMarginPercentage || 0}
                    onChange={(e) => updateConfig(
                      'additionalCosts.profitMarginPercentage',
                      parseFloat(e.target.value)
                    )}
                  />
                </div>
                <p className="margin-note">
                  Most jewelers: 25-40% | Recommended: 30%
                </p>
              </div>

              <div className="cost-card">
                <div className="cost-icon">📦</div>
                <h3>Other Charges</h3>
                <p>Packaging, certificates, shipping materials</p>
                <p className="helper-text-small">💡 Typical range: $5-$20 per piece</p>
                <div className="input-with-icon large">
                  <span className="input-icon">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={config.additionalCosts?.otherCharges || 0}
                    onChange={(e) => updateConfig(
                      'additionalCosts.otherCharges',
                      parseFloat(e.target.value)
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="cost-summary">
              <h3>Cost Breakdown Example (5g 14K ring)</h3>
              <div className="summary-row">
                <span>Base Metal Cost:</span>
                <span>$275.00</span>
              </div>
              <div className="summary-row">
                <span>Labor Cost:</span>
                <span>${(config.additionalCosts?.laborCost || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Making Charges:</span>
                <span>${(config.additionalCosts?.makingCharges || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Other Charges:</span>
                <span>${(config.additionalCosts?.otherCharges || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row subtotal">
                <span>Subtotal:</span>
                <span>
                  ${(275 + (config.additionalCosts?.laborCost || 0) + 
                    (config.additionalCosts?.makingCharges || 0) + 
                    (config.additionalCosts?.otherCharges || 0)).toFixed(2)}
                </span>
              </div>
              <div className="summary-row margin">
                <span>Profit Margin ({config.additionalCosts?.profitMarginPercentage || 0}%):</span>
                <span>
                  ${((275 + (config.additionalCosts?.laborCost || 0) + 
                    (config.additionalCosts?.makingCharges || 0) + 
                    (config.additionalCosts?.otherCharges || 0)) * 
                    ((config.additionalCosts?.profitMarginPercentage || 0) / 100)).toFixed(2)}
                </span>
              </div>
              <div className="summary-row total">
                <span>Final Selling Price:</span>
                <span>
                  ${((275 + (config.additionalCosts?.laborCost || 0) + 
                    (config.additionalCosts?.makingCharges || 0) + 
                    (config.additionalCosts?.otherCharges || 0)) * 
                    (1 + (config.additionalCosts?.profitMarginPercentage || 0) / 100)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>🧮 Price Calculator</h2>
              <p>Test your pricing configuration with real calculations</p>
            </div>

            <div className="calculator-container">
              <div className="calculator-inputs">
                <div className="calc-group">
                  <label>Weight (grams)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calculator.weight}
                    onChange={(e) => setCalculator({ ...calculator, weight: e.target.value })}
                  />
                </div>

                <div className="calc-group">
                  <label>Metal Composition</label>
                  <select
                    value={calculator.composition}
                    onChange={(e) => setCalculator({ ...calculator, composition: e.target.value })}
                  >
                    {config.compositionRates?.filter(c => c.isEnabled).map(comp => (
                      <option key={comp.name} value={comp.name}>{comp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="calc-group">
                  <label>Material Finish</label>
                  <select
                    value={calculator.material}
                    onChange={(e) => setCalculator({ ...calculator, material: e.target.value })}
                  >
                    <option value="yellow-gold">Yellow Gold</option>
                    <option value="white-gold">White Gold</option>
                    <option value="rose-gold">Rose Gold</option>
                  </select>
                </div>

                <div className="calc-group">
                  <label>Diamond Type</label>
                  <select
                    value={calculator.diamondType}
                    onChange={(e) => setCalculator({ ...calculator, diamondType: e.target.value })}
                  >
                    <option value="none">No Diamond</option>
                    {config.diamondPricing?.filter(d => d.isEnabled).map(diamond => (
                      <option key={diamond.name} value={diamond.name.toLowerCase().replace(/\s+/g, '-')}>
                        {diamond.name}
                      </option>
                    ))}
                  </select>
                </div>

                {calculator.diamondType !== 'none' && (
                  <div className="calc-group">
                    <label>Diamond Carat</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculator.diamondCarat}
                      onChange={(e) => setCalculator({ ...calculator, diamondCarat: e.target.value })}
                    />
                  </div>
                )}

                <div className="calc-group">
                  <label>Ring Size</label>
                  <select
                    value={calculator.ringSize}
                    onChange={(e) => setCalculator({ ...calculator, ringSize: e.target.value })}
                  >
                    {['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={calculatePrice}
                  disabled={calculator.calculating}
                  className="btn-calculate"
                >
                  {calculator.calculating ? '⏳ Calculating...' : '🧮 Calculate Price'}
                </button>
              </div>

              {calculator.result && (
                <div className="calculator-result">
                  <h3>💰 Calculated Price</h3>
                  <div className="result-breakdown">
                    <div className="result-row">
                      <span>Metal Cost:</span>
                      <span>${calculator.result.breakdown.metalCost.toFixed(2)}</span>
                    </div>
                    {calculator.result.breakdown.diamondCost > 0 && (
                      <div className="result-row">
                        <span>Diamond Cost:</span>
                        <span>${calculator.result.breakdown.diamondCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="result-row">
                      <span>Labor & Making:</span>
                      <span>
                        ${((calculator.result.breakdown.laborCost || 0) + 
                          (calculator.result.breakdown.makingCharges || 0)).toFixed(2)}
                      </span>
                    </div>
                    {calculator.result.breakdown.ringSizeAdjustment !== 0 && (
                      <div className="result-row">
                        <span>Size Adjustment:</span>
                        <span>
                          {calculator.result.breakdown.ringSizeAdjustment > 0 ? '+' : ''}
                          ${calculator.result.breakdown.ringSizeAdjustment.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="result-row subtotal">
                      <span>Subtotal:</span>
                      <span>${calculator.result.breakdown.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="result-row profit">
                      <span>Profit Margin:</span>
                      <span>+${calculator.result.breakdown.profitAmount.toFixed(2)}</span>
                    </div>
                    <div className="result-row total">
                      <span>Final Price:</span>
                      <span className="final-price">${calculator.result.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Button Footer */}
      <div className="pricing-footer">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-save-footer"
        >
          {saving ? '⏳ Saving Changes...' : '💾 Save All Changes'}
        </button>
      </div>
    </div>
  );
};

export default PricingConfig;
