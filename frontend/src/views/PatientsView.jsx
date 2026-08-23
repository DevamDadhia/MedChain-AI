import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  BedDouble,
  Activity,
  Stethoscope,
  HeartPulse,
} from "lucide-react";
import { getPatients } from "../api/patients";
import StatusBadge from "../components/StatusBadge";
import KPICard from "../components/KPICard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function PatientsView() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [limit, setLimit] = useState(100);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPatients(limit);
      setPatients(res?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  const roomTypes = useMemo(() => {
    const set = new Set(patients.map((p) => p.room_type).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [patients]);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchSearch =
        (p.patient_id || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.primary_diagnosis || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.procedure_performed || "").toLowerCase().includes(search.toLowerCase());
      const matchRoom = roomFilter === "ALL" || p.room_type === roomFilter;
      return matchSearch && matchRoom;
    });
  }, [patients, search, roomFilter]);

  const avgBedDays = useMemo(() => {
    if (patients.length === 0) return 0;
    const sum = patients.reduce((acc, p) => acc + (Number(p.bed_days) || 0), 0);
    return (sum / patients.length).toFixed(1);
  }, [patients]);

  const icuCount = patients.filter((p) => (p.room_type || "").toUpperCase().includes("ICU")).length;

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="eyebrow">CLINICAL ADMISSIONS & PATIENT CENSUS</div>
          <h2 className="view-title">Patient Admissions & Clinical Resource Usage</h2>
          <p className="view-subtitle">
            Active admissions tracking, clinical diagnoses, procedures, and dedicated equipment/supply utilization.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Reload Patients</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* KPI Row */}
      <div className="kpi-grid">
        <KPICard
          title="Total Admitted Patients"
          value={patients.length}
          subtitle="Monitored in current dataset"
          icon={UserPlus}
        />
        <KPICard
          title="Average Bed Days (LOS)"
          value={`${avgBedDays} days`}
          subtitle="Length of stay metric"
          icon={BedDouble}
        />
        <KPICard
          title="ICU / Critical Beds"
          value={icuCount}
          subtitle="High-acuity clinical care"
          icon={HeartPulse}
          variant={icuCount > 10 ? "high" : "normal"}
        />
        <KPICard
          title="Active Diagnoses"
          value={new Set(patients.map((p) => p.primary_diagnosis)).size}
          subtitle="Clinical diagnosis classifications"
          icon={Stethoscope}
        />
      </div>

      {/* Filter Controls */}
      <div className="controls-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search patient ID, diagnosis, procedure..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {roomTypes.length > 1 && (
          <div className="filter-group">
            <span className="filter-label">Room Type:</span>
            {roomTypes.map((r) => (
              <button
                key={r}
                className={`filter-btn ${roomFilter === r ? "active" : ""}`}
                onClick={() => setRoomFilter(r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        <div className="limit-selector">
          <span className="filter-label">Limit:</span>
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

      {/* Patient Table */}
      <div className="panel" style={{ marginTop: "16px" }}>
        {loading ? (
          <LoadingSkeleton rows={8} type="table" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Primary Diagnosis</th>
                  <th>Procedure</th>
                  <th>Room Type</th>
                  <th>Bed Days</th>
                  <th>Supplies Used</th>
                  <th>Equipment Used</th>
                  <th>Admission Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((p, idx) => (
                    <tr key={p.id || p.patient_id || idx}>
                      <td>
                        <code className="text-cyan font-bold">{p.patient_id}</code>
                      </td>
                      <td>
                        <strong className="text-white">{p.primary_diagnosis || "General Admission"}</strong>
                      </td>
                      <td className="text-muted">{p.procedure_performed || "Monitoring"}</td>
                      <td>
                        <span className={`type-badge ${(p.room_type || "").includes("ICU") ? "badge-critical-type" : ""}`}>
                          {p.room_type || "General"}
                        </span>
                      </td>
                      <td className="font-semibold">{p.bed_days ?? 1} d</td>
                      <td className="text-muted text-sm">{p.supplies_used || "Standard Pack"}</td>
                      <td>
                        <span className="pill-generic">{p.equipment_used || "Standard"}</span>
                      </td>
                      <td className="text-muted text-sm">{p.admission_date || "Recent"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-muted">
                      No patient records found matching current criteria.
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

export default PatientsView;
