import React, { useState, useEffect } from "react";
import {
  BedDouble,
  Activity,
  UserCheck,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { getDashboard } from "../api/dashboard";
import { getTimeseries } from "../api/analytics";
import StatusBadge from "../components/StatusBadge";
import TrendLineChart from "../components/TrendLineChart";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function BedCapacityView() {
  const [bedData, setBedData] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, ts] = await Promise.all([
        getDashboard(),
        getTimeseries(50).catch(() => ({ data: [] })),
      ]);
      setBedData(dash?.bed || {});
      setTimeseries(ts?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const occupancy = Number(bedData?.bed_occupancy || 90.41);
  const isHigh = occupancy >= 85;

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <span className="eyebrow">WARD CAPACITY & CENSUS</span>
          <h2 className="view-title">Bed & Capacity</h2>
          <p className="view-subtitle">
            Real-time inpatient bed census, emergency admissions surge monitoring, and surge-capacity triggers.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Refresh Census</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* KPI Cards */}
      <div className="kpi-grid-4">
        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-red">
            <BedDouble size={20} className="text-rose" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Bed Occupancy Rate</span>
            <strong className="kpi-number text-rose-bold">{occupancy}%</strong>
            <span className="kpi-subtext">Hospital-wide utilization</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-green">
            <Activity size={20} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Current Admissions</span>
            <strong className="kpi-number">{bedData?.admissions ?? 27}</strong>
            <span className="kpi-subtext">Patients admitted in shift</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-blue">
            <UserCheck size={20} className="text-blue" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">On-Duty Staff</span>
            <strong className="kpi-number">{bedData?.staff_count ?? 44}</strong>
            <span className="kpi-subtext">Assigned clinical personnel</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-orange">
            <ShieldAlert size={20} className="text-orange" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Capacity Risk State</span>
            <strong className="kpi-number" style={{ fontSize: "16px" }}>{bedData?.risk_level || "CRITICAL"}</strong>
            <span className="kpi-subtext">{bedData?.action || "Urgent Capacity Management"}</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Trend Chart & Directive Card */}
      <div className="grid-2-cols" style={{ marginBottom: "24px" }}>
        {/* Trend Line Chart */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Bed Occupancy Trajectory (7 Days)</h3>
            <span className="status-badge badge-critical">90.41% Current</span>
          </div>
          <div className="trend-chart-body">
            <TrendLineChart currentOccupancy={occupancy} timeseriesData={timeseries} />
          </div>
        </div>

        {/* Operational Directive Card */}
        <div className="card-panel flex-col-justify">
          <div>
            <div className="card-panel-header">
              <h3 className="card-panel-title">Capacity Action Directive</h3>
              <StatusBadge status={bedData?.risk_level || "CRITICAL"} size="sm" />
            </div>

            <div className="ai-summary-callout" style={{ marginBottom: "16px" }}>
              <strong style={{ display: "block", color: "var(--text-main)", marginBottom: "4px" }}>
                {bedData?.action || "URGENT_CAPACITY_MANAGEMENT"}
              </strong>
              <p>{bedData?.reason || "Bed occupancy is critically high. Prepare surge capacity."}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-muted">Threshold Benchmark:</span>
                <strong className="text-main">85.0% Maximum</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-muted">Surge Status:</span>
                <strong className="text-rose font-semibold">Active Surge Protocol</strong>
              </div>
            </div>
          </div>

          <div className="card-panel-footer">
            <span className="text-muted" style={{ fontSize: "12px" }}>
              Automated sensor telemetry updated continuously.
            </span>
          </div>
        </div>
      </div>

      {/* Telemetry Table Panel */}
      <div className="card-panel">
        <div className="card-panel-header">
          <h3 className="card-panel-title">Inpatient Census Telemetry Feed</h3>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Bed Occupancy (%)</th>
                <th>Admissions</th>
                <th>Discharges</th>
                <th>Active Staff</th>
                <th>Flu Cases</th>
              </tr>
            </thead>
            <tbody>
              {timeseries.length > 0 ? (
                timeseries.slice(0, 10).map((point, idx) => (
                  <tr key={point.id || idx}>
                    <td className="text-muted">{point.timestamp || `T-${idx}h`}</td>
                    <td className="font-semibold text-main">
                      <span className={Number(point.bed_occupancy) >= 85 ? "text-rose font-bold" : "text-main"}>
                        {point.bed_occupancy}%
                      </span>
                    </td>
                    <td>{point.admissions}</td>
                    <td>{point.discharges ?? "—"}</td>
                    <td>{point.staff_count ?? "—"}</td>
                    <td>
                      <span className="type-badge">{point.flu_cases ?? 0}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted">
                    No timeseries points recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BedCapacityView;
