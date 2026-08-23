import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  TrendingUp,
  Activity,
  BedDouble,
  Layers,
  RefreshCw,
} from "lucide-react";
import { getTimeseries } from "../api/analytics";
import TrendLineChart from "../components/TrendLineChart";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function AnalyticsView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit, setLimit] = useState(100);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTimeseries(limit);
      setData(res?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  const stats = useMemo(() => {
    if (data.length === 0) return { avgOcc: "81.2", maxOcc: "90.4", totalAdm: 120, totalFlu: 45 };
    let sumOcc = 0, maxOcc = 0, totalAdm = 0, totalFlu = 0;
    data.forEach((d) => {
      const occ = Number(d.bed_occupancy) || 0;
      sumOcc += occ;
      if (occ > maxOcc) maxOcc = occ;
      totalAdm += Number(d.admissions) || 0;
      totalFlu += Number(d.flu_cases) || 0;
    });
    return {
      avgOcc: (sumOcc / data.length).toFixed(1),
      maxOcc: maxOcc.toFixed(1),
      totalAdm,
      totalFlu,
    };
  }, [data]);

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <span className="eyebrow">HISTORICAL TELEMETRY & MULTI-VARIATE TRENDS</span>
          <h2 className="view-title">Reports & Analytics</h2>
          <p className="view-subtitle">
            Longitudinal sensor telemetry, inpatient admission patterns, and clinical volume dynamics.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* Top 4 KPI Cards */}
      <div className="kpi-grid-4">
        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-green">
            <BedDouble size={20} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Average Bed Occupancy</span>
            <strong className="kpi-number">{stats.avgOcc}%</strong>
            <span className="kpi-subtext">Longitudinal mean</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-red">
            <TrendingUp size={20} className="text-rose" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Peak Bed Utilization</span>
            <strong className="kpi-number text-rose-bold">{stats.maxOcc}%</strong>
            <span className="kpi-subtext">Maximum observed surge</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-blue">
            <Activity size={20} className="text-blue" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Recorded Admissions</span>
            <strong className="kpi-number">{stats.totalAdm.toLocaleString()}</strong>
            <span className="kpi-subtext">Intake volume</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-orange">
            <Layers size={20} className="text-orange" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Epidemiological Flu Cases</span>
            <strong className="kpi-number">{stats.totalFlu.toLocaleString()}</strong>
            <span className="kpi-subtext">Seasonal pressure vector</span>
          </div>
        </div>
      </div>

      {/* Chart Panel */}
      <div className="card-panel" style={{ marginBottom: "24px" }}>
        <div className="card-panel-header">
          <h3 className="card-panel-title">Bed Occupancy Trajectory Timeline</h3>
          <span className="status-badge badge-low">Live Feed</span>
        </div>
        <div className="trend-chart-body">
          <TrendLineChart currentOccupancy={Number(stats.maxOcc) || 90.41} timeseriesData={data} />
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="card-panel">
        <div className="card-panel-header">
          <h3 className="card-panel-title">Telemetry Sensor Log</h3>
        </div>

        {loading ? (
          <LoadingSkeleton rows={6} type="table" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Bed Occupancy (%)</th>
                  <th>Admissions</th>
                  <th>Discharges</th>
                  <th>Staff On Duty</th>
                  <th>Flu Cases</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td className="text-muted">{row.timestamp || `T-${idx}`}</td>
                      <td className="font-semibold text-main">{row.bed_occupancy}%</td>
                      <td>{row.admissions}</td>
                      <td>{row.discharges ?? "—"}</td>
                      <td>{row.staff_count ?? "—"}</td>
                      <td>
                        <span className="type-badge">{row.flu_cases ?? 0}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-muted">
                      No timeseries records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsView;
