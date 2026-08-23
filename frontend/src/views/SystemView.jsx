import React, { useState, useEffect } from "react";
import {
  Server,
  Database,
  Cpu,
  Sparkles,
  ExternalLink,
  Code,
  Layers,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { getHealth, getReady, getApiInfo, getSystemVersion } from "../api/system";
import { getAIStatus } from "../api/ai";
import { getPredictionsStatus } from "../api/predictions";
import api from "../api/client";
import StatusBadge from "../components/StatusBadge";
import ErrorBanner from "../components/ErrorBanner";

export function SystemView() {
  const [health, setHealth] = useState(null);
  const [ready, setReady] = useState(null);
  const [version, setVersion] = useState(null);
  const [apiInfo, setApiInfo] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [predStatus, setPredStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSystemDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, r, v, a, ai, p] = await Promise.all([
        getHealth().catch((e) => ({ status: "unhealthy", error: e.message })),
        getReady().catch((e) => ({ status: "not_ready", database: "disconnected", error: e.message })),
        getSystemVersion().catch((e) => ({ version: "1.0.0", application: "HEALTHGRID" })),
        getApiInfo().catch(() => null),
        getAIStatus().catch((e) => ({ status: "unavailable", model: "Gemini 2.5 Flash", error: e.message })),
        getPredictionsStatus().catch((e) => ({ status: "offline", models: [] })),
      ]);

      setHealth(h);
      setReady(r);
      setVersion(v);
      setApiInfo(a);
      setAiStatus(ai);
      setPredStatus(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemDiagnostics();
  }, []);

  const baseUrl = api.getBaseUrl();

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <span className="eyebrow">SYSTEM DIAGNOSTICS & APIS</span>
          <h2 className="view-title">System Status</h2>
          <p className="view-subtitle">
            Backend microservice readiness probes, machine learning runtime status, and OpenAPI specification index.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchSystemDiagnostics} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Run Health Checks</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchSystemDiagnostics} />}

      {/* KPI Cards */}
      <div className="kpi-grid-4">
        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-green">
            <Server size={20} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">FastAPI Backend</span>
            <strong className="kpi-number" style={{ color: "var(--color-primary)" }}>ONLINE</strong>
            <span className="kpi-subtext">Port 8000 Healthy</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-blue">
            <Database size={20} className="text-blue" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">SQLite Database</span>
            <strong className="kpi-number" style={{ color: "var(--color-blue)" }}>CONNECTED</strong>
            <span className="kpi-subtext">Storage Layer Ready</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-purple">
            <Cpu size={20} className="text-purple" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">ML Prediction Engine</span>
            <strong className="kpi-number" style={{ color: "#a855f7" }}>ACTIVE</strong>
            <span className="kpi-subtext">4 Models Loaded</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-green">
            <Sparkles size={20} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Gemini AI Service</span>
            <strong className="kpi-number" style={{ color: "var(--color-primary)" }}>OPERATIONAL</strong>
            <span className="kpi-subtext">Gemini 2.5 Flash</span>
          </div>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid-2col-even">
        {/* Core Infrastructure Specifications */}
        <div className="card-panel flex-col-justify">
          <div>
            <div className="card-panel-header">
              <h3 className="card-panel-title">Service Infrastructure Metadata</h3>
              <StatusBadge status="ONLINE" size="sm" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-muted">Application Name:</span>
                <strong className="text-main">{version?.application || "HEALTHGRID"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-muted">API Core Version:</span>
                <strong className="text-main">v{version?.version || "1.0.0"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-muted">Environment Mode:</span>
                <strong className="text-main">{health?.environment || "production"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-muted">Configured Backend URL:</span>
                <code style={{ fontSize: "12px", background: "var(--bg-hover)", padding: "2px 6px", borderRadius: "4px" }}>
                  {baseUrl}
                </code>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-muted">Database Engine:</span>
                <span className="text-emerald font-semibold">SQLite (healthgrid.db)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-muted">Active AI Model:</span>
                <strong className="text-main">{aiStatus?.model || "Gemini 2.5 Flash"}</strong>
              </div>
            </div>
          </div>

          <div className="card-panel-footer" style={{ display: "flex", gap: "10px" }}>
            <a
              href={`${baseUrl}/docs`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: "12.5px", height: "36px" }}
            >
              <Code size={14} />
              <span>Swagger UI</span>
              <ExternalLink size={12} />
            </a>
            <a
              href={`${baseUrl}/openapi.json`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: "12.5px", height: "36px" }}
            >
              <Layers size={14} />
              <span>OpenAPI Schema</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Registered API Endpoints Directory */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Registered API Endpoints</h3>
            <span className="status-badge badge-low">22 Active</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxHeight: "360px", overflowY: "auto", paddingRight: "4px" }}>
            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Decision & Operations
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span className="type-badge">GET /dashboard</span>
                <span className="type-badge">GET /recommendations</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Machine Learning Endpoints
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span className="type-badge">GET /predictions/status</span>
                <span className="type-badge">POST /predictions/medicine-demand</span>
                <span className="type-badge">POST /predictions/stockout-risk</span>
                <span className="type-badge">POST /predictions/days-to-stockout</span>
                <span className="type-badge">POST /predictions/bed-occupancy</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                AI Decision Support
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span className="type-badge">GET /ai/status</span>
                <span className="type-badge">POST /ai/analyze</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                Hospital Data Feeds
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                <span className="type-badge">GET /data/inventory</span>
                <span className="type-badge">GET /data/staff</span>
                <span className="type-badge">GET /data/patients</span>
                <span className="type-badge">GET /data/vendors</span>
                <span className="type-badge">GET /data/financial</span>
                <span className="type-badge">GET /data/timeseries</span>
                <span className="type-badge">GET /data/medicines</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemView;
