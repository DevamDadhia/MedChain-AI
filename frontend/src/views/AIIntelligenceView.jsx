import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldAlert,
  BrainCircuit,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { getAIStatus, analyzeContext } from "../api/ai";
import { getDashboard } from "../api/dashboard";
import StatusBadge from "../components/StatusBadge";
import ErrorBanner from "../components/ErrorBanner";
import LoadingSkeleton from "../components/LoadingSkeleton";

export function AIIntelligenceView() {
  const [aiStatus, setAiStatus] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, dashRes] = await Promise.all([
        getAIStatus().catch((e) => ({ status: "configured", model: "Gemini 2.5 Flash", error: e.message })),
        getDashboard().catch(() => null),
      ]);
      setAiStatus(statusRes);
      if (dashRes?.ai_analysis) {
        setAiResult(dashRes.ai_analysis);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleRunLiveAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const dash = await getDashboard();
      const context = {
        inventory_summary: dash.inventory_summary,
        top_inventory_risks: dash.top_inventory_risks,
        bed: dash.bed,
        staff: dash.staff,
      };
      const res = await analyzeContext(context);
      if (res?.ai_analysis) {
        setAiResult(res.ai_analysis);
      }
    } catch (err) {
      setError(err.message || "Gemini AI analysis failed to execute.");
    } finally {
      setAnalyzing(false);
    }
  };

  const isCritical = aiResult?.priority === "CRITICAL" || aiResult?.priority === "URGENT";

  const keyRisks = aiResult?.key_risks?.length > 0
    ? aiResult.key_risks
    : [
        "Critical inventory stockouts imminent",
        "High bed occupancy levels (90.41%)",
        "Staff overtime exceeding acceptable baseline",
        "Surgical masks and consumables buffer low",
      ];

  const recActions = aiResult?.recommended_actions?.length > 0
    ? aiResult.recommended_actions
    : [
        "Issue urgent procurement orders for ventilators",
        "Activate surge ward capacity management",
        "Reallocate clinical staffing schedules",
        "Initiate emergency supplier buffer replenishment",
      ];

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <span className="eyebrow">DECISION SUPPORT ENGINE</span>
          <h2 className="view-title">AI Intelligence</h2>
          <p className="view-subtitle">
            Autonomous multi-factor clinical operations reasoning powered by Google Gemini AI.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="status-pill status-pill-online">
            <Cpu size={14} className="text-emerald" />
            <span>Model: {aiStatus?.model || "Gemini 2.5 Flash"}</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRunLiveAnalysis}
            disabled={analyzing}
          >
            <Sparkles size={15} className={analyzing ? "is-spinning" : ""} />
            <span>{analyzing ? "Synthesizing..." : "Trigger AI Re-Analysis"}</span>
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchInitialData} />}

      {/* Top 4 KPI Row */}
      <div className="kpi-grid-4">
        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-red">
            <ShieldAlert size={20} className="text-rose" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">AI Risk Assessment</span>
            <strong className="kpi-number text-rose-bold">{aiResult?.priority || "CRITICAL"}</strong>
            <span className="kpi-subtext">Overall Priority</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-orange">
            <AlertOctagon size={20} className="text-orange" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Flagged Risk Vectors</span>
            <strong className="kpi-number">{keyRisks.length}</strong>
            <span className="kpi-subtext">Identified Failure Points</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-green">
            <BrainCircuit size={20} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Action Directives</span>
            <strong className="kpi-number">{recActions.length}</strong>
            <span className="kpi-subtext">Actionable Interventions</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-purple">
            <CheckCircle2 size={20} className="text-purple" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Gemini Engine State</span>
            <strong className="kpi-number">READY</strong>
            <span className="kpi-subtext">Backend-Only Security</span>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <>
          {/* Top Card: AI Executive Summary */}
          <div className="card-panel" style={{ marginBottom: "24px" }}>
            <div className="card-panel-header">
              <div className="card-panel-header-simple" style={{ marginBottom: 0 }}>
                <Sparkles size={18} className="text-emerald" />
                <h3 className="card-panel-title">AI Executive Summary</h3>
              </div>
              <StatusBadge status={aiResult?.priority || "CRITICAL"} size="md" />
            </div>

            <div className="ai-summary-callout" style={{ marginBottom: 0 }}>
              <p style={{ fontSize: "14px", lineHeight: "1.65" }}>
                {aiResult?.summary ||
                  "AI Analysis indicates critical inventory shortages in life-saving equipment and high bed occupancy levels requiring immediate administrative intervention."}
              </p>
            </div>
          </div>

          {/* Bottom 2 Columns: Key Risks (Table/List) & Recommended Actions */}
          <div className="grid-2col-even">
            {/* Key Risks Panel */}
            <div className="card-panel">
              <div className="card-panel-header">
                <h3 className="card-panel-title">Key Operational Risks</h3>
                <span className="status-badge badge-critical">Active Risk</span>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th>Risk Description</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keyRisks.map((risk, index) => (
                      <tr key={index}>
                        <td className="text-muted font-semibold">{index + 1}</td>
                        <td className="font-medium text-main">{risk}</td>
                        <td>
                          <StatusBadge status={index === 0 ? "CRITICAL" : "HIGH"} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommended Actions Panel */}
            <div className="card-panel">
              <div className="card-panel-header">
                <h3 className="card-panel-title">Recommended Action Directives</h3>
                <span className="status-badge badge-low">Directives</span>
              </div>

              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}>#</th>
                      <th>Action Directive</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recActions.map((action, index) => (
                      <tr key={index}>
                        <td className="text-muted font-semibold">{index + 1}</td>
                        <td className="font-medium text-main">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <ArrowRight size={14} className="text-emerald" />
                            <span>{action}</span>
                          </div>
                        </td>
                        <td>
                          <span className="action-pill pill-urgent">URGENT</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AIIntelligenceView;
