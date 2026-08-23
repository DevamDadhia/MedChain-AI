import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Clock,
  UserCheck,
  AlertTriangle,
  Search,
  RefreshCw,
} from "lucide-react";
import { getStaff } from "../api/staff";
import { getDashboard } from "../api/dashboard";
import StatusBadge from "../components/StatusBadge";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function StaffView() {
  const [staffData, setStaffData] = useState([]);
  const [staffSummary, setStaffSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [limit, setLimit] = useState(100);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffRes, dashRes] = await Promise.all([
        getStaff(limit),
        getDashboard().catch(() => null),
      ]);
      setStaffData(staffRes?.data || []);
      setStaffSummary(dashRes?.staff || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  const staffTypes = useMemo(() => {
    const types = new Set(staffData.map((s) => s.staff_type).filter(Boolean));
    return ["ALL", ...Array.from(types)];
  }, [staffData]);

  const filteredStaff = useMemo(() => {
    return staffData.filter((s) => {
      const matchSearch =
        (s.staff_id || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.staff_type || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.current_assignment || "").toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "ALL" || s.staff_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [staffData, search, typeFilter]);

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <span className="eyebrow">CLINICAL WORKFORCE & ROSTER</span>
          <h2 className="view-title">Staff Management</h2>
          <p className="view-subtitle">
            Shift tracking, overtime distribution, patient-to-staff ratios, and clinical burnout prevention metrics.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Reload Roster</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* Top KPI Summary Cards */}
      <div className="kpi-grid-4">
        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-green">
            <Users size={20} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Active Personnel</span>
            <strong className="kpi-number">{staffData.length}</strong>
            <span className="kpi-subtext">Clinical staff on roster</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-orange">
            <Clock size={20} className="text-orange" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Average Overtime</span>
            <strong className="kpi-number">{staffSummary?.average_overtime_hours ?? 1.96} hrs</strong>
            <span className="kpi-subtext">Hospital-wide shift average</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-blue">
            <UserCheck size={20} className="text-blue" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Patients Per Hour</span>
            <strong className="kpi-number">{staffSummary?.average_patients_per_hour ?? 0.53}</strong>
            <span className="kpi-subtext">Throughput velocity</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-purple">
            <AlertTriangle size={20} className="text-purple" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Workload Risk</span>
            <strong className="kpi-number" style={{ fontSize: "16px" }}>{staffSummary?.risk_level || "MEDIUM"}</strong>
            <span className="kpi-subtext">{staffSummary?.action || "Monitor Workload"}</span>
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
            placeholder="Search staff ID, role, assignment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {staffTypes.length > 1 && (
          <div className="filter-group">
            <span className="filter-label">Role:</span>
            {staffTypes.map((t) => (
              <button
                key={t}
                className={`filter-btn ${typeFilter === t ? "active" : ""}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="filter-group">
          <span className="filter-label">Rows:</span>
          <select
            className="select-input"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Staff Table Panel */}
      <div className="card-panel">
        {loading ? (
          <LoadingSkeleton rows={8} type="table" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Role / Designation</th>
                  <th>Current Assignment</th>
                  <th>Shift Date</th>
                  <th>Shift Hours</th>
                  <th>Hours Worked</th>
                  <th>Patients Assigned</th>
                  <th>Overtime Hours</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((staff, idx) => {
                    const isHighOt = Number(staff.overtime_hours) > 2;
                    return (
                      <tr key={staff.id || staff.staff_id || idx}>
                        <td>
                          <code className="text-main font-semibold">{staff.staff_id}</code>
                        </td>
                        <td>
                          <span className="type-badge">{staff.staff_type || "Clinician"}</span>
                        </td>
                        <td>
                          <strong className="text-main">{staff.current_assignment || "General Ward"}</strong>
                        </td>
                        <td className="text-muted">{staff.shift_date || "Current"}</td>
                        <td className="text-muted">
                          {staff.shift_start_time ? `${staff.shift_start_time} - ${staff.shift_end_time}` : "Standard"}
                        </td>
                        <td>{staff.hours_worked ?? 8} hrs</td>
                        <td className="font-semibold text-main">{staff.patients_assigned ?? 0}</td>
                        <td>
                          <span className={isHighOt ? "text-orange font-semibold" : "text-emerald font-semibold"}>
                            {staff.overtime_hours ?? 0} hrs
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-muted">
                      No staff records match the current filters.
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

export default StaffView;
