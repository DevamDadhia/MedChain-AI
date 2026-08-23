import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertOctagon,
  Clock,
  BedDouble,
  Play,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import {
  getPredictionsStatus,
  predictMedicineDemand,
  predictStockoutRisk,
  predictDaysToStockout,
  predictBedOccupancy,
} from "../api/predictions";
import StatusBadge from "../components/StatusBadge";
import ErrorBanner from "../components/ErrorBanner";

const PRESETS = {
  medicine: [
    {
      name: "Seasonal Demand",
      data: { sales_year: 2026, sales_month: 8, demand_lag_1: 450, demand_lag_2: 420, demand_lag_3: 390, demand_rolling_3: 420 },
    },
    {
      name: "Flu Epidemic Surge",
      data: { sales_year: 2026, sales_month: 11, demand_lag_1: 1250, demand_lag_2: 980, demand_lag_3: 650, demand_rolling_3: 960 },
    },
  ],
  stockout: [
    {
      name: "Ventilator Shortage",
      data: {
        current_stock: 120,
        min_required: 500,
        max_capacity: 1000,
        unit_cost: 1500,
        avg_usage_per_day: 80,
        restock_lead_time: 14,
        stock_coverage_days: 1.5,
        stock_capacity_ratio: 0.12,
        minimum_stock_ratio: 0.24,
        lead_time_demand: 1120,
        stock_surplus: -380,
        estimated_days_to_stockout: 1.5,
        recommended_reorder_quantity: 880,
      },
    },
    {
      name: "Buffer Supply",
      data: {
        current_stock: 850,
        min_required: 300,
        max_capacity: 1000,
        unit_cost: 45,
        avg_usage_per_day: 15,
        restock_lead_time: 4,
        stock_coverage_days: 56.6,
        stock_capacity_ratio: 0.85,
        minimum_stock_ratio: 2.83,
        lead_time_demand: 60,
        stock_surplus: 550,
        estimated_days_to_stockout: 56.6,
        recommended_reorder_quantity: 0,
      },
    },
  ],
  daysStockout: [
    {
      name: "Mask Depletion",
      data: {
        current_stock: 160,
        min_required: 427,
        max_capacity: 1200,
        unit_cost: 2.5,
        avg_usage_per_day: 481,
        restock_lead_time: 17,
        stock_coverage_days: 0.33,
        stock_capacity_ratio: 0.13,
        minimum_stock_ratio: 0.37,
        stockout_risk: 1,
        lead_time_demand: 8177,
        stock_surplus: -267,
        recommended_reorder_quantity: 1040,
      },
    },
  ],
  bed: [
    {
      name: "Night Surge",
      data: {
        bed_occupancy_lag_1: 88.5,
        bed_occupancy_lag_2: 86.2,
        bed_occupancy_lag_24: 79.0,
        admissions_lag_1: 18,
        admissions_lag_24: 12,
        staff_count: 42,
        flu_cases: 65,
        hour: 22,
        day_of_week: 5,
        month: 8,
      },
    },
    {
      name: "Normal Shift",
      data: {
        bed_occupancy_lag_1: 62.0,
        bed_occupancy_lag_2: 60.5,
        bed_occupancy_lag_24: 65.0,
        admissions_lag_1: 5,
        admissions_lag_24: 6,
        staff_count: 55,
        flu_cases: 12,
        hour: 10,
        day_of_week: 2,
        month: 8,
      },
    },
  ],
};

export function PredictionsView() {
  const [activeModel, setActiveModel] = useState("medicine");
  const [statusInfo, setStatusInfo] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);

  const [medicineForm, setMedicineForm] = useState(PRESETS.medicine[0].data);
  const [stockoutForm, setStockoutForm] = useState(PRESETS.stockout[0].data);
  const [daysStockoutForm, setDaysStockoutForm] = useState(PRESETS.daysStockout[0].data);
  const [bedForm, setBedForm] = useState(PRESETS.bed[0].data);

  useEffect(() => {
    getPredictionsStatus()
      .then((res) => setStatusInfo(res))
      .catch((err) => console.error("Predictions status error:", err));
  }, []);

  const handleRunPrediction = async (e) => {
    e.preventDefault();
    setExecuting(true);
    setError(null);
    setPredictionResult(null);

    try {
      let res;
      if (activeModel === "medicine") {
        res = await predictMedicineDemand(medicineForm);
      } else if (activeModel === "stockout") {
        res = await predictStockoutRisk(stockoutForm);
      } else if (activeModel === "daysStockout") {
        res = await predictDaysToStockout(daysStockoutForm);
      } else if (activeModel === "bed") {
        res = await predictBedOccupancy(bedForm);
      }
      setPredictionResult(res);
    } catch (err) {
      setError(err.message || "Failed to execute machine learning inference.");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="view-container">
      {/* View Header */}
      <div className="view-header">
        <div>
          <span className="eyebrow">PREDICTIVE MACHINE LEARNING</span>
          <h2 className="view-title">Prediction Center</h2>
          <p className="view-subtitle">
            Execute real-time inference across 4 production machine learning models trained on hospital operations.
          </p>
        </div>

        <div className="status-pill status-pill-online">
          <Cpu size={14} className="text-emerald" />
          <span>4 Models Active</span>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div className="model-selector-grid">
        <button
          className={`model-card-tab ${activeModel === "medicine" ? "active" : ""}`}
          onClick={() => {
            setActiveModel("medicine");
            setPredictionResult(null);
            setError(null);
          }}
        >
          <TrendingUp size={20} className="model-tab-icon" />
          <div>
            <strong>Medicine Demand</strong>
            <small>Unit demand forecast</small>
          </div>
        </button>

        <button
          className={`model-card-tab ${activeModel === "stockout" ? "active" : ""}`}
          onClick={() => {
            setActiveModel("stockout");
            setPredictionResult(null);
            setError(null);
          }}
        >
          <AlertOctagon size={20} className="model-tab-icon" />
          <div>
            <strong>Stockout Risk</strong>
            <small>Risk classification</small>
          </div>
        </button>

        <button
          className={`model-card-tab ${activeModel === "daysStockout" ? "active" : ""}`}
          onClick={() => {
            setActiveModel("daysStockout");
            setPredictionResult(null);
            setError(null);
          }}
        >
          <Clock size={20} className="model-tab-icon" />
          <div>
            <strong>Days to Stockout</strong>
            <small>Depletion timeline</small>
          </div>
        </button>

        <button
          className={`model-card-tab ${activeModel === "bed" ? "active" : ""}`}
          onClick={() => {
            setActiveModel("bed");
            setPredictionResult(null);
            setError(null);
          }}
        >
          <BedDouble size={20} className="model-tab-icon" />
          <div>
            <strong>Bed Occupancy</strong>
            <small>Ward capacity rate</small>
          </div>
        </button>
      </div>

      {/* Left: Input Form | Right: Result Card */}
      <div className="grid-2col-even">
        {/* Input Form Panel */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Model Input Parameters</h3>
            <div className="preset-bar">
              <span className="preset-label">Presets:</span>
              {(PRESETS[activeModel] || []).map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  className="preset-btn"
                  onClick={() => {
                    if (activeModel === "medicine") setMedicineForm(preset.data);
                    if (activeModel === "stockout") setStockoutForm(preset.data);
                    if (activeModel === "daysStockout") setDaysStockoutForm(preset.data);
                    if (activeModel === "bed") setBedForm(preset.data);
                    setPredictionResult(null);
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRunPrediction}>
            {activeModel === "medicine" && (
              <div className="form-grid">
                <div className="form-field">
                  <label>Sales Year</label>
                  <input
                    type="number"
                    value={medicineForm.sales_year}
                    onChange={(e) => setMedicineForm({ ...medicineForm, sales_year: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Sales Month (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={medicineForm.sales_month}
                    onChange={(e) => setMedicineForm({ ...medicineForm, sales_month: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Demand Lag 1 (Units)</label>
                  <input
                    type="number"
                    step="any"
                    value={medicineForm.demand_lag_1}
                    onChange={(e) => setMedicineForm({ ...medicineForm, demand_lag_1: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Demand Lag 2 (Units)</label>
                  <input
                    type="number"
                    step="any"
                    value={medicineForm.demand_lag_2}
                    onChange={(e) => setMedicineForm({ ...medicineForm, demand_lag_2: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Demand Lag 3 (Units)</label>
                  <input
                    type="number"
                    step="any"
                    value={medicineForm.demand_lag_3}
                    onChange={(e) => setMedicineForm({ ...medicineForm, demand_lag_3: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Demand 3-Mo Rolling Avg</label>
                  <input
                    type="number"
                    step="any"
                    value={medicineForm.demand_rolling_3}
                    onChange={(e) => setMedicineForm({ ...medicineForm, demand_rolling_3: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {activeModel === "stockout" && (
              <div className="form-grid">
                <div className="form-field">
                  <label>Current Stock</label>
                  <input
                    type="number"
                    value={stockoutForm.current_stock}
                    onChange={(e) => setStockoutForm({ ...stockoutForm, current_stock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Minimum Required</label>
                  <input
                    type="number"
                    value={stockoutForm.min_required}
                    onChange={(e) => setStockoutForm({ ...stockoutForm, min_required: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Max Storage Capacity</label>
                  <input
                    type="number"
                    value={stockoutForm.max_capacity}
                    onChange={(e) => setStockoutForm({ ...stockoutForm, max_capacity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Unit Cost (₹ / $)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stockoutForm.unit_cost}
                    onChange={(e) => setStockoutForm({ ...stockoutForm, unit_cost: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Avg Usage / Day</label>
                  <input
                    type="number"
                    step="any"
                    value={stockoutForm.avg_usage_per_day}
                    onChange={(e) => setStockoutForm({ ...stockoutForm, avg_usage_per_day: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Restock Lead Time (Days)</label>
                  <input
                    type="number"
                    step="any"
                    value={stockoutForm.restock_lead_time}
                    onChange={(e) => setStockoutForm({ ...stockoutForm, restock_lead_time: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {activeModel === "daysStockout" && (
              <div className="form-grid">
                <div className="form-field">
                  <label>Current Stock</label>
                  <input
                    type="number"
                    value={daysStockoutForm.current_stock}
                    onChange={(e) => setDaysStockoutForm({ ...daysStockoutForm, current_stock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Minimum Required</label>
                  <input
                    type="number"
                    value={daysStockoutForm.min_required}
                    onChange={(e) => setDaysStockoutForm({ ...daysStockoutForm, min_required: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Avg Daily Usage</label>
                  <input
                    type="number"
                    step="any"
                    value={daysStockoutForm.avg_usage_per_day}
                    onChange={(e) => setDaysStockoutForm({ ...daysStockoutForm, avg_usage_per_day: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Lead Time (Days)</label>
                  <input
                    type="number"
                    step="any"
                    value={daysStockoutForm.restock_lead_time}
                    onChange={(e) => setDaysStockoutForm({ ...daysStockoutForm, restock_lead_time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Stockout Risk Binary (0/1)</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    value={daysStockoutForm.stockout_risk}
                    onChange={(e) => setDaysStockoutForm({ ...daysStockoutForm, stockout_risk: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Reorder Quantity</label>
                  <input
                    type="number"
                    value={daysStockoutForm.recommended_reorder_quantity}
                    onChange={(e) => setDaysStockoutForm({ ...daysStockoutForm, recommended_reorder_quantity: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {activeModel === "bed" && (
              <div className="form-grid">
                <div className="form-field">
                  <label>Occupancy Lag 1h (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={bedForm.bed_occupancy_lag_1}
                    onChange={(e) => setBedForm({ ...bedForm, bed_occupancy_lag_1: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Occupancy Lag 24h (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={bedForm.bed_occupancy_lag_24}
                    onChange={(e) => setBedForm({ ...bedForm, bed_occupancy_lag_24: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Admissions Lag 1h</label>
                  <input
                    type="number"
                    value={bedForm.admissions_lag_1}
                    onChange={(e) => setBedForm({ ...bedForm, admissions_lag_1: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Active Staff Count</label>
                  <input
                    type="number"
                    value={bedForm.staff_count}
                    onChange={(e) => setBedForm({ ...bedForm, staff_count: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Active Flu Cases</label>
                  <input
                    type="number"
                    value={bedForm.flu_cases}
                    onChange={(e) => setBedForm({ ...bedForm, flu_cases: e.target.value })}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Hour of Day (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={bedForm.hour}
                    onChange={(e) => setBedForm({ ...bedForm, hour: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div style={{ marginTop: "20px" }}>
              <button type="submit" className="btn btn-primary" disabled={executing} style={{ width: "100%" }}>
                <Play size={15} className={executing ? "is-spinning" : ""} />
                <span>{executing ? "Running Inference..." : "Run ML Inference"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Inference Result Card */}
        <div className="card-panel flex-col-justify">
          <div>
            <div className="card-panel-header">
              <h3 className="card-panel-title">Prediction Result</h3>
              {predictionResult && <span className="status-badge badge-low">Verified Output</span>}
            </div>

            {error && <ErrorBanner message={error} />}

            {!predictionResult && !error && (
              <div className="empty-prediction-state">
                <Cpu size={42} className="text-muted" style={{ opacity: 0.5 }} />
                <h4>Ready for Inference</h4>
                <p>Select a scenario preset or modify inputs, then click <strong>Run ML Inference</strong>.</p>
              </div>
            )}

            {predictionResult && (
              <div className="prediction-result-display">
                {predictionResult.prediction_type === "medicine_demand" && (
                  <div className="result-card">
                    <span className="result-label">Predicted Monthly Demand</span>
                    <div className="result-primary-val">
                      <strong>{predictionResult.predicted_demand?.toLocaleString()}</strong>
                      <small>units</small>
                    </div>
                    <div className="result-meta">
                      <span>Model: <code>medicine_demand_model</code></span>
                      <StatusBadge status="READY" size="sm" />
                    </div>
                  </div>
                )}

                {predictionResult.prediction_type === "stockout_risk" && (
                  <div className="result-card">
                    <span className="result-label">Stockout Classification</span>
                    <div className="result-primary-val">
                      <StatusBadge
                        status={predictionResult.stockout_risk ? "CRITICAL" : "LOW"}
                        size="md"
                      />
                    </div>
                    {predictionResult.risk_probability !== null && (
                      <div className="prob-meter-wrap">
                        <div className="prob-bar-header">
                          <span>Risk Probability:</span>
                          <strong>{(predictionResult.risk_probability * 100).toFixed(1)}%</strong>
                        </div>
                        <div className="prob-meter">
                          <div
                            className={`prob-fill ${predictionResult.risk_probability > 0.5 ? "fill-crit" : "fill-low"}`}
                            style={{ width: `${Math.min(predictionResult.risk_probability * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="result-meta">
                      <span>Model: <code>stockout_model</code></span>
                    </div>
                  </div>
                )}

                {predictionResult.prediction_type === "days_to_stockout" && (
                  <div className="result-card">
                    <span className="result-label">Estimated Days to Depletion</span>
                    <div className="result-primary-val">
                      <strong className={predictionResult.predicted_days < 3 ? "text-rose" : "text-main"}>
                        {predictionResult.predicted_days}
                      </strong>
                      <small>operational days</small>
                    </div>
                    <div className="result-meta">
                      <StatusBadge
                        status={predictionResult.predicted_days < 2 ? "CRITICAL" : predictionResult.predicted_days < 7 ? "HIGH" : "LOW"}
                        size="sm"
                      />
                      <span>Model: <code>days_to_stockout_model</code></span>
                    </div>
                  </div>
                )}

                {predictionResult.prediction_type === "bed_occupancy" && (
                  <div className="result-card">
                    <span className="result-label">Predicted Bed Occupancy</span>
                    <div className="result-primary-val">
                      <strong className={predictionResult.predicted_bed_occupancy >= 85 ? "text-rose" : "text-main"}>
                        {predictionResult.predicted_bed_occupancy}%
                      </strong>
                    </div>
                    <div className="prob-meter-wrap">
                      <div className="prob-bar-header">
                        <span>Ward Capacity:</span>
                        <strong>{predictionResult.predicted_bed_occupancy}%</strong>
                      </div>
                      <div className="prob-meter">
                        <div
                          className={`prob-fill ${predictionResult.predicted_bed_occupancy >= 85 ? "fill-crit" : "fill-low"}`}
                          style={{ width: `${Math.min(predictionResult.predicted_bed_occupancy, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="result-meta">
                      <span>Model: <code>bed_occupancy_model</code></span>
                      <StatusBadge status={predictionResult.predicted_bed_occupancy >= 85 ? "CRITICAL" : "LOW"} size="sm" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictionsView;
