import React, { useState, useEffect, useMemo } from "react";
import {
  Boxes,
  Search,
  AlertOctagon,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  Pill,
} from "lucide-react";
import { getInventory, getMedicines } from "../api/inventory";
import StatusBadge from "../components/StatusBadge";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function InventoryView() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [inventoryData, setInventoryData] = useState([]);
  const [medicinesData, setMedicinesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [limit, setLimit] = useState(100);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, medRes] = await Promise.all([
        getInventory(limit),
        getMedicines(limit),
      ]);
      setInventoryData(invRes?.data || []);
      setMedicinesData(medRes?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  const processedInventory = useMemo(() => {
    return inventoryData.map((item) => {
      let riskLevel = item.risk_level;
      if (!riskLevel) {
        const stock = Number(item.current_stock || 0);
        const minReq = Number(item.min_required || 0);
        const usage = Number(item.avg_usage_per_day || 1);
        const lead = Number(item.restock_lead_time || 0);
        const daysToStockout = usage > 0 ? stock / usage : 999;

        if (stock < minReq || daysToStockout <= lead) {
          riskLevel = "CRITICAL";
        } else if (daysToStockout <= lead * 1.5) {
          riskLevel = "HIGH";
        } else if (daysToStockout <= lead * 2.5) {
          riskLevel = "MEDIUM";
        } else {
          riskLevel = "LOW";
        }
      }
      return { ...item, calculated_risk: riskLevel };
    });
  }, [inventoryData]);

  const filteredData = useMemo(() => {
    if (activeTab === "inventory") {
      return processedInventory.filter((item) => {
        const nameMatch =
          (item.item_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (item.item_id || "").toLowerCase().includes(search.toLowerCase()) ||
          (item.item_type || "").toLowerCase().includes(search.toLowerCase());
        const riskMatch =
          riskFilter === "ALL" ||
          (item.calculated_risk || item.risk_level) === riskFilter;
        return nameMatch && riskMatch;
      });
    } else {
      return medicinesData.filter((item) => {
        return (
          (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (item.invoice || "").toLowerCase().includes(search.toLowerCase()) ||
          (item.dosage_form || "").toLowerCase().includes(search.toLowerCase())
        );
      });
    }
  }, [activeTab, processedInventory, medicinesData, search, riskFilter]);

  const criticalCount = processedInventory.filter((i) => (i.calculated_risk || i.risk_level) === "CRITICAL").length;
  const highCount = processedInventory.filter((i) => (i.calculated_risk || i.risk_level) === "HIGH").length;

  return (
    <div className="view-container">
      {/* Page Header */}
      <div className="view-header">
        <div>
          <span className="eyebrow">ASSET & PHARMACEUTICAL REGISTRY</span>
          <h2 className="view-title">Inventory Intelligence</h2>
          <p className="view-subtitle">
            Comprehensive hospital equipment, pharmaceutical stock levels, daily burn rates, and supplier lead times.
          </p>
        </div>

        <div className="tab-pill-group">
          <button
            className={`pill-btn ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <Boxes size={15} />
            <span>Hospital Inventory ({processedInventory.length})</span>
          </button>
          <button
            className={`pill-btn ${activeTab === "medicines" ? "active" : ""}`}
            onClick={() => setActiveTab("medicines")}
          >
            <Pill size={15} />
            <span>Medicines ({medicinesData.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid-4">
        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-green">
            <Boxes size={20} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Monitored Assets</span>
            <strong className="kpi-number">{processedInventory.length.toLocaleString()}</strong>
            <span className="kpi-subtext">Active catalog items</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-red">
            <AlertOctagon size={20} className="text-rose" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Critical Deficits</span>
            <strong className="kpi-number text-rose-bold">{criticalCount}</strong>
            <span className="kpi-subtext">Immediate reorder required</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-orange">
            <AlertTriangle size={20} className="text-orange" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">High-Risk Warnings</span>
            <strong className="kpi-number">{highCount}</strong>
            <span className="kpi-subtext">Short buffer remaining</span>
          </div>
        </div>

        <div className="kpi-card-white">
          <div className="kpi-icon-circle bg-circle-blue">
            <Pill size={20} className="text-blue" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Medicine Transactions</span>
            <strong className="kpi-number">{medicinesData.length}</strong>
            <span className="kpi-subtext">Recent ledger records</span>
          </div>
        </div>
      </div>

      {/* Control / Filter Bar */}
      <div className="controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={activeTab === "inventory" ? "Search item name, asset ID, category..." : "Search medicine name, barcode, invoice..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch("")}>
              <X size={14} />
            </button>
          )}
        </div>

        {activeTab === "inventory" && (
          <div className="filter-group">
            <span className="filter-label">Risk:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((r) => (
              <button
                key={r}
                className={`filter-btn ${riskFilter === r ? "active" : ""}`}
                onClick={() => setRiskFilter(r)}
              >
                {r}
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

        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Reload</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* Data Table Panel */}
      <div className="card-panel">
        {loading ? (
          <LoadingSkeleton rows={8} type="table" />
        ) : activeTab === "inventory" ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medical Asset</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Min Required</th>
                  <th>Daily Burn</th>
                  <th>Lead Time</th>
                  <th>Unit Cost</th>
                  <th>Risk Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, idx) => {
                    const risk = item.calculated_risk || item.risk_level || "LOW";
                    return (
                      <tr key={item.id || item.item_id || idx}>
                        <td>
                          <div className="item-name-cell">
                            <strong className="text-main">{item.item_name}</strong>
                            <small className="text-muted">{item.item_id}</small>
                          </div>
                        </td>
                        <td>
                          <span className="type-badge">{item.item_type || "General Supply"}</span>
                        </td>
                        <td className="font-semibold text-main">
                          {Number(item.current_stock || 0).toLocaleString()}
                        </td>
                        <td className="text-muted">{Number(item.min_required || 0).toLocaleString()}</td>
                        <td>{item.avg_usage_per_day ?? "—"} /day</td>
                        <td>{item.restock_lead_time ?? "—"} d</td>
                        <td>${Number(item.unit_cost || 0).toFixed(2)}</td>
                        <td>
                          <StatusBadge status={risk} size="sm" />
                        </td>
                        <td>
                          <button
                            className="action-btn-inspect"
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye size={13} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-6 text-muted">
                      No inventory records match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Dosage Form</th>
                  <th>Barcode</th>
                  <th>Invoice</th>
                  <th>Units Sold</th>
                  <th>Type</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((med, idx) => (
                    <tr key={med.id || idx}>
                      <td>
                        <strong className="text-main">{med.name}</strong>
                      </td>
                      <td>
                        <span className="type-badge">{med.dosage_form || "Tablet"}</span>
                      </td>
                      <td><code>{med.barcode || "—"}</code></td>
                      <td>{med.invoice || "—"}</td>
                      <td className="font-semibold">{med.sales_sheet ?? med.sheet ?? 0}</td>
                      <td>
                        <span className="type-badge">{med.transaction_type || "Sale"}</span>
                      </td>
                      <td className="text-muted text-sm">
                        {med.added_date} {med.time || ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-muted">
                      No medicine records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Inspection Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">ASSET SPECIFICATIONS</span>
                <h3>{selectedItem.item_name}</h3>
                <code style={{ fontSize: "12px", color: "var(--color-primary)" }}>{selectedItem.item_id}</code>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Asset Classification</span>
                  <strong className="detail-val">{selectedItem.item_type || "Medical Asset"}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Current Stock In Hand</span>
                  <strong className="detail-val text-main">
                    {Number(selectedItem.current_stock || 0).toLocaleString()} units
                  </strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Minimum Safety Threshold</span>
                  <strong className="detail-val">{Number(selectedItem.min_required || 0).toLocaleString()} units</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Daily Burn Rate</span>
                  <strong className="detail-val">{selectedItem.avg_usage_per_day} units/day</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Restock Lead Time</span>
                  <strong className="detail-val">{selectedItem.restock_lead_time} days</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Unit Cost</span>
                  <strong className="detail-val">${Number(selectedItem.unit_cost || 0).toFixed(2)}</strong>
                </div>
              </div>

              <div className="modal-risk-banner">
                <StatusBadge status={selectedItem.calculated_risk || selectedItem.risk_level} size="md" />
                <span style={{ fontSize: "13px", color: "var(--text-main)" }}>
                  Horizon to Stockout: <strong>{selectedItem.avg_usage_per_day > 0 ? `${(Number(selectedItem.current_stock || 0) / Number(selectedItem.avg_usage_per_day)).toFixed(1)} days` : "Sufficient"}</strong>
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryView;
