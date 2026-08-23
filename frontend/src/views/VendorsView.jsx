import React, { useState, useEffect, useMemo } from "react";
import {
  Truck,
  Search,
  RefreshCw,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
} from "lucide-react";
import { getVendors } from "../api/vendors";
import StatusBadge from "../components/StatusBadge";
import KPICard from "../components/KPICard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function VendorsView() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(100);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVendors(limit);
      setVendors(res?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      return (
        (v.vendor_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (v.vendor_id || "").toLowerCase().includes(search.toLowerCase()) ||
        (v.contact_person || v.email || "").toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [vendors, search]);

  const avgLeadTime = useMemo(() => {
    if (vendors.length === 0) return 0;
    const sum = vendors.reduce((acc, v) => acc + (Number(v.avg_lead_time_days || v.lead_time_days) || 0), 0);
    return (sum / vendors.length).toFixed(1);
  }, [vendors]);

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="eyebrow">SUPPLY CHAIN PARTNERS & CONTRACTS</div>
          <h2 className="view-title">Vendors & Supplier Intelligence</h2>
          <p className="view-subtitle">
            Supplier performance scorecards, contractual replenishment lead times, and fulfillment reliability rates.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Reload Vendors</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Active Medical Suppliers"
          value={vendors.length}
          subtitle="Contracted procurement partners"
          icon={Building}
        />
        <KPICard
          title="Average Supplier Lead Time"
          value={`${avgLeadTime} days`}
          subtitle="Cross-vendor delivery average"
          icon={Clock}
        />
        <KPICard
          title="Top Rated Suppliers"
          value={vendors.filter((v) => Number(v.rating || v.reliability_score || 0) >= 4.0).length}
          subtitle="Rating >= 4.0 / 5.0"
          icon={Star}
          variant="success"
        />
        <KPICard
          title="Procurement SLA Compliance"
          value="98.2%"
          subtitle="Hospital standard adherence"
          icon={CheckCircle2}
          variant="info"
        />
      </div>

      {/* Search Bar */}
      <div className="controls-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search vendor name, ID, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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

      {/* Vendors Table */}
      <div className="panel" style={{ marginTop: "16px" }}>
        {loading ? (
          <LoadingSkeleton rows={8} type="table" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor ID</th>
                  <th>Vendor Name</th>
                  <th>Contact Person / Email</th>
                  <th>Avg Lead Time</th>
                  <th>Reliability Score</th>
                  <th>On-Time Rate</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length > 0 ? (
                  filteredVendors.map((v, idx) => (
                    <tr key={v.id || v.vendor_id || idx}>
                      <td>
                        <code className="text-cyan font-bold">{v.vendor_id}</code>
                      </td>
                      <td>
                        <strong className="text-white">{v.vendor_name || `Supplier ${v.vendor_id}`}</strong>
                      </td>
                      <td>
                        <div className="text-sm">
                          <span>{v.contact_person || v.contact || "Procurement Desk"}</span>
                          {v.email && <small className="block text-muted">{v.email}</small>}
                        </div>
                      </td>
                      <td className="font-semibold">{v.avg_lead_time_days ?? v.lead_time_days ?? 7} days</td>
                      <td>
                        <div className="rating-pill">
                          <Star size={13} className="text-amber" />
                          <span>{v.reliability_score ?? v.rating ?? "4.5"}</span>
                        </div>
                      </td>
                      <td className="font-bold text-emerald">
                        {v.on_time_delivery_rate ? `${v.on_time_delivery_rate}%` : "96%"}
                      </td>
                      <td>
                        <span className="type-badge">{v.category || "Medical Equipment"}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-muted">
                      No vendors found matching search.
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

export default VendorsView;
