import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Search,
  RefreshCw,
  TrendingUp,
  CreditCard,
  PieChart,
  Calendar,
} from "lucide-react";
import { getFinancial } from "../api/financial";
import StatusBadge from "../components/StatusBadge";
import KPICard from "../components/KPICard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function FinancialView() {
  const [financialData, setFinancialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(100);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFinancial(limit);
      setFinancialData(res?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [limit]);

  const filteredData = useMemo(() => {
    return financialData.filter((f) => {
      return (
        (f.department || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.category || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.description || "").toLowerCase().includes(search.toLowerCase()) ||
        (f.transaction_id || "").toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [financialData, search]);

  const totalExpenditure = useMemo(() => {
    return filteredData.reduce((acc, f) => acc + (Number(f.amount) || 0), 0);
  }, [filteredData]);

  const avgTransaction = useMemo(() => {
    if (filteredData.length === 0) return 0;
    return (totalExpenditure / filteredData.length).toFixed(2);
  }, [filteredData, totalExpenditure]);

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="eyebrow">FISCAL OPERATIONS & BUDGET ALLOCATION</div>
          <h2 className="view-title">Financial Intelligence</h2>
          <p className="view-subtitle">
            Departmental operational expenditures, pharmaceutical procurement costs, and supply chain ledger.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchData} disabled={loading}>
          <RefreshCw size={14} className={loading ? "is-spinning" : ""} />
          <span>Reload Ledger</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchData} />}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Recorded Transactions"
          value={financialData.length}
          subtitle="Ledger records loaded"
          icon={CreditCard}
        />
        <KPICard
          title="Total Expenditure"
          value={`$${Math.round(totalExpenditure).toLocaleString()}`}
          subtitle="Cumulative transaction value"
          icon={DollarSign}
          variant="normal"
        />
        <KPICard
          title="Average Ticket Size"
          value={`$${Number(avgTransaction).toLocaleString()}`}
          subtitle="Per-transaction mean"
          icon={TrendingUp}
        />
        <KPICard
          title="Departments Tracked"
          value={new Set(financialData.map((f) => f.department)).size || 1}
          subtitle="Cost centers active"
          icon={PieChart}
        />
      </div>

      {/* Search Bar */}
      <div className="controls-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search department, category, transaction ID..."
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

      {/* Financial Table */}
      <div className="panel" style={{ marginTop: "16px" }}>
        {loading ? (
          <LoadingSkeleton rows={8} type="table" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((f, idx) => (
                    <tr key={f.id || f.transaction_id || idx}>
                      <td>
                        <code className="text-cyan font-bold">{f.transaction_id || `TXN-${idx + 1000}`}</code>
                      </td>
                      <td className="text-muted">{f.date || "Recent"}</td>
                      <td>
                        <strong className="text-white">{f.department || "General Hospital"}</strong>
                      </td>
                      <td>
                        <span className="type-badge">{f.category || "Procurement"}</span>
                      </td>
                      <td className="text-muted text-sm">{f.description || "Medical stock replenishment"}</td>
                      <td>
                        <span className="pill-generic">{f.type || "Expense"}</span>
                      </td>
                      <td className="font-bold text-white">
                        ${Number(f.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-muted">
                      No financial transactions found.
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

export default FinancialView;
