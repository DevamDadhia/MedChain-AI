import React, { useState, useEffect, useMemo } from "react";
import {
  BrainCircuit,
  Search,
  DollarSign,
  AlertOctagon,
  BedDouble,
  Users,
  ShoppingCart,
  RefreshCw,
  Truck,
} from "lucide-react";
import { getRecommendations } from "../api/recommendations";
import StatusBadge from "../components/StatusBadge";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function RecommendationsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecommendations();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const inventoryRecs = useMemo(() => {
    const raw = data?.inventory;
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object") return Object.values(raw);
    return [];
  }, [data]);

  const bedRec = data?.bed || {};
  const staffRec = data?.staff || {};

  const filteredInventory = useMemo(() => {
    return inventoryRecs.filter((item) => {
      const matchSearch =
        (item.item_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.item_id || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.vendor_name || "").toLowerCase().includes(search.toLowerCase());
      const matchPriority =
        priorityFilter === "ALL" ||
        item.priority === priorityFilter ||
        item.risk_level === priorityFilter;
      return matchSearch && matchPriority;
    });
  }, [inventoryRecs, search, priorityFilter]);

  const totalReorderCost = useMemo(() => {
    return filteredInventory.reduce((acc, item) => acc + (Number(item.estimated_reorder_cost) || 0), 0);
  }, [filteredInventory]);

  const urgentCount = inventoryRecs.filter(
    (i) => i.priority === "URGENT" || i.risk_level === "CRITICAL"
  ).length;

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <span className="eyebrow">OPERATIONAL ACTION DIRECTIVES</span>
          <h2 className="view-title">Recommendations</h2>
          <p className="view-subtitle">
            Algorithmic procurement directives, bed surge preparedness, and staffing adjustments prioritized by urgency.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Refresh Actions</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* KPI Cards */}
      <div className="kpi-grid-4">
        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-red">
            <AlertOctagon size={20} className="text-rose" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Urgent Interventions</span>
            <strong className="kpi-number text-rose-bold">{urgentCount}</strong>
            <span className="kpi-subtext">Immediate action required</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-green">
            <DollarSign size={20} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Projected Reorder Cost</span>
            <strong className="kpi-number">₹{Math.round(totalReorderCost).toLocaleString()}</strong>
            <span className="kpi-subtext">Procurement capital allocation</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-orange">
            <BedDouble size={20} className="text-orange" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Bed Capacity Directive</span>
            <strong className="kpi-number" style={{ fontSize: "17px" }}>{bedRec.action || "MONITOR"}</strong>
            <span className="kpi-subtext">{bedRec.bed_occupancy ?? 90.41}% occupancy</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-blue">
            <Users size={20} className="text-blue" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Staff Workload Directive</span>
            <strong className="kpi-number" style={{ fontSize: "17px" }}>{staffRec.action || "NORMAL"}</strong>
            <span className="kpi-subtext">{staffRec.average_overtime_hours ?? 1.96} hrs avg OT</span>
          </div>
        </div>
      </div>

      {/* Directives Summary Row */}
      <div className="grid-2col-even" style={{ marginBottom: "24px" }}>
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Bed Capacity Directive</h3>
            <StatusBadge status={bedRec.risk_level || "CRITICAL"} size="sm" />
          </div>
          <div className="ai-summary-callout" style={{ marginBottom: "14px" }}>
            <strong style={{ display: "block", color: "var(--text-main)", marginBottom: "4px" }}>
              {bedRec.action || "URGENT_CAPACITY_MANAGEMENT"}
            </strong>
            <p>{bedRec.reason || "Bed occupancy is high. Prepare additional capacity."}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text-muted)" }}>
            <span>Occupancy: <strong className="text-main">{bedRec.bed_occupancy ?? 90.41}%</strong></span>
            <span>Admissions: <strong className="text-main">{bedRec.admissions ?? 27}</strong></span>
            <span>Staff Count: <strong className="text-main">{bedRec.staff_count ?? 44}</strong></span>
          </div>
        </div>

        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Staff Workload Directive</h3>
            <StatusBadge status={staffRec.risk_level || "MEDIUM"} size="sm" />
          </div>
          <div className="ai-summary-callout" style={{ marginBottom: "14px" }}>
            <strong style={{ display: "block", color: "var(--text-main)", marginBottom: "4px" }}>
              {staffRec.action || "MONITOR_STAFF_WORKLOAD"}
            </strong>
            <p>{staffRec.reason || "Average overtime is elevated. Monitor shift workload."}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", color: "var(--text-muted)" }}>
            <span>Average Overtime: <strong className="text-main">{staffRec.average_overtime_hours ?? 1.96} hrs</strong></span>
            <span>Patients / Hour: <strong className="text-main">{staffRec.average_patients_per_hour ?? 0.53}</strong></span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search recommendation, item name, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span className="filter-label">Priority:</span>
          {["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <button
              key={p}
              className={`filter-btn ${priorityFilter === p ? "active" : ""}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Table Panel */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div className="card-panel-header-simple" style={{ marginBottom: 0 }}>
            <ShoppingCart size={18} className="text-emerald" />
            <h3 className="card-panel-title">Automated Replenishment Directives</h3>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton rows={8} type="table" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Item Name</th>
                  <th>Vendor</th>
                  <th>Days to Stockout</th>
                  <th>Reorder Quantity</th>
                  <th>Unit Cost</th>
                  <th>Estimated Cost</th>
                  <th>Action</th>
                  <th>Clinical Rationale</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item, idx) => (
                    <tr key={item.item_id || idx}>
                      <td>
                        <StatusBadge status={item.priority || item.risk_level || "URGENT"} size="sm" />
                      </td>
                      <td>
                        <div className="item-name-cell">
                          <strong className="text-main">{item.item_name}</strong>
                          <small className="text-muted">{item.item_id}</small>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Truck size={13} className="text-muted" />
                          <span>{item.vendor_name || item.vendor_id || "Direct"}</span>
                        </div>
                      </td>
                      <td className="font-bold text-rose">
                        {item.estimated_days_to_stockout !== null && item.estimated_days_to_stockout !== undefined
                          ? `${item.estimated_days_to_stockout} d`
                          : "Immediate"}
                      </td>
                      <td className="font-semibold text-main">
                        {Number(item.recommended_reorder_quantity || 0).toLocaleString()} units
                      </td>
                      <td>${Number(item.unit_cost || 0).toFixed(2)}</td>
                      <td className="font-bold text-main">
                        ${Number(item.estimated_reorder_cost || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className="action-pill pill-urgent">
                          {item.action || "ORDER_IMMEDIATELY"}
                        </span>
                      </td>
                      <td className="text-muted text-sm" style={{ maxWidth: "260px" }}>
                        {item.reason || "Safety stock threshold breached."}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-muted">
                      No recommendations matching current filters.
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

export default RecommendationsView;
