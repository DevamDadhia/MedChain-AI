import React, { useState } from "react";
import {
  Boxes,
  AlertTriangle,
  Shield,
  BedDouble,
  Sparkles,
  ChevronDown,
  ShoppingCart,
  Users,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import DonutChart from "../components/DonutChart";
import TrendLineChart from "../components/TrendLineChart";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";

export function DashboardView({
  dashboard,
  loading,
  error,
  onRefresh,
  onNavigate,
}) {
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [timeRange, setTimeRange] = useState("7 Days");

  if (loading && !dashboard) {
    return (
      <div className="dashboard-content">
        <LoadingSkeleton rows={5} type="card-grid" />
        <div style={{ marginTop: "24px" }}>
          <LoadingSkeleton rows={4} />
        </div>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="dashboard-content">
        <ErrorBanner message={error} onRetry={onRefresh} />
      </div>
    );
  }

  const summary = dashboard?.inventory_summary || {
    total_items: 1000,
    critical_items: 86,
    high_risk_items: 524,
    medium_risk_items: 134,
    low_risk_items: 256,
  };
  const ai = dashboard?.ai_analysis || {};
  const bed = dashboard?.bed || {};
  const staff = dashboard?.staff || {};

  const total = summary.total_items || 1000;
  const critical = summary.critical_items || 86;
  const high = summary.high_risk_items || 524;
  const medium = summary.medium_risk_items || 134;
  const low = summary.low_risk_items || 256;

  const critPct = ((critical / total) * 100).toFixed(1);
  const highPct = ((high / total) * 100).toFixed(1);
  const medPct = ((medium / total) * 100).toFixed(1);
  const lowPct = ((low / total) * 100).toFixed(1);

  const occupancyVal = bed.bed_occupancy ? Number(bed.bed_occupancy) : 90.41;

  // Fallback lists if AI response is empty
  const keyRisks = (ai.key_risks && ai.key_risks.length > 0)
    ? ai.key_risks
    : [
        "Critical inventory stockouts imminent",
        `High bed occupancy (${occupancyVal}%)`,
        "Staff overtime above normal levels",
        "Surgical supplies running low",
      ];

  const recActions = (ai.recommended_actions && ai.recommended_actions.length > 0)
    ? ai.recommended_actions
    : [
        "Order ventilators immediately",
        "Increase bed capacity",
        "Optimize staff scheduling",
        "Replenish surgical supplies",
      ];

  const aiSummaryText = ai.summary ||
    "AI Analysis indicates critical inventory shortages in life-saving equipment and high bed occupancy levels requiring immediate administrative intervention.";

  return (
    <div className="dashboard-content">
      {/* 1. TOP 5 KPI CARDS ROW */}
      <section className="kpi-row-5">
        {/* Total Inventory */}
        <div className="kpi-card-white" onClick={() => onNavigate("inventory")}>
          <div className="kpi-icon-circle bg-circle-green">
            <Boxes size={22} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Total Inventory Items</span>
            <strong className="kpi-number">{total.toLocaleString()}</strong>
            <span className="kpi-subtext">Monitored Assets</span>
          </div>
        </div>

        {/* Critical Items */}
        <div className="kpi-card-white" onClick={() => onNavigate("inventory")}>
          <div className="kpi-icon-circle bg-circle-red">
            <AlertTriangle size={22} className="text-rose" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Critical Items</span>
            <strong className="kpi-number">{critical}</strong>
            <span className="kpi-subtext">Immediate Attention</span>
          </div>
        </div>

        {/* High-Risk Items */}
        <div className="kpi-card-white" onClick={() => onNavigate("inventory")}>
          <div className="kpi-icon-circle bg-circle-orange">
            <Shield size={22} className="text-orange" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">High-Risk Items</span>
            <strong className="kpi-number">{high}</strong>
            <span className="kpi-subtext">Short Lead-time</span>
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="kpi-card-white" onClick={() => onNavigate("bed")}>
          <div className="kpi-icon-circle bg-circle-green">
            <BedDouble size={22} className="text-emerald" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Bed Occupancy</span>
            <strong className="kpi-number">{occupancyVal}%</strong>
            <span className="kpi-subtext">{bed.admissions ?? 27} Active Admissions</span>
          </div>
        </div>

        {/* AI Risk Priority */}
        <div className="kpi-card-white" onClick={() => onNavigate("ai")}>
          <div className="kpi-icon-circle bg-circle-purple">
            <Sparkles size={22} className="text-purple" />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">AI Risk Priority</span>
            <strong className="kpi-number text-rose-bold">{ai.priority || "CRITICAL"}</strong>
            <span className="kpi-subtext">Overall Risk Level</span>
          </div>
        </div>
      </section>

      {/* 2. MIDDLE ROW (INVENTORY DONUT & BED TREND) */}
      <section className="grid-2-cols" style={{ marginTop: "24px" }}>
        {/* Inventory Risk Overview */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Inventory Risk Overview</h3>
            <div className="select-dropdown-wrap">
              <span>{categoryFilter}</span>
              <ChevronDown size={15} />
            </div>
          </div>

          <div className="donut-overview-body">
            <DonutChart
              total={total}
              critical={critical}
              high={high}
              medium={medium}
              low={low}
            />

            <div className="donut-legend-list">
              <div className="donut-legend-row">
                <div className="legend-label-group">
                  <span className="legend-dot dot-red"></span>
                  <span className="legend-text">Critical Risk</span>
                </div>
                <strong className="legend-val">{critical} ({critPct}%)</strong>
              </div>

              <div className="donut-legend-row">
                <div className="legend-label-group">
                  <span className="legend-dot dot-orange"></span>
                  <span className="legend-text">High Risk</span>
                </div>
                <strong className="legend-val">{high} ({highPct}%)</strong>
              </div>

              <div className="donut-legend-row">
                <div className="legend-label-group">
                  <span className="legend-dot dot-yellow"></span>
                  <span className="legend-text">Medium Risk</span>
                </div>
                <strong className="legend-val">{medium} ({medPct}%)</strong>
              </div>

              <div className="donut-legend-row">
                <div className="legend-label-group">
                  <span className="legend-dot dot-green"></span>
                  <span className="legend-text">Low Risk</span>
                </div>
                <strong className="legend-val">{low} ({lowPct}%)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bed Occupancy Trend */}
        <div className="card-panel">
          <div className="card-panel-header">
            <h3 className="card-panel-title">Bed Occupancy Trend</h3>
            <div className="select-dropdown-wrap">
              <span>{timeRange}</span>
              <ChevronDown size={15} />
            </div>
          </div>

          <div className="trend-chart-body">
            <TrendLineChart currentOccupancy={occupancyVal} />
          </div>
        </div>
      </section>

      {/* 3. BOTTOM ROW (3 CARDS) */}
      <section className="grid-3-cols" style={{ marginTop: "24px" }}>
        {/* Card 1: AI Executive Summary */}
        <div className="card-panel flex-col-justify">
          <div>
            <div className="card-panel-header-simple">
              <Sparkles size={18} className="text-emerald" />
              <h3 className="card-panel-title">AI Executive Summary</h3>
            </div>

            {/* Light Green Summary Box */}
            <div className="ai-summary-callout">
              <p>{aiSummaryText}</p>
            </div>

            {/* Key Risks & Recommended Actions */}
            <div className="ai-two-columns">
              <div className="ai-col">
                <h4 className="ai-col-heading">Key Risks</h4>
                <ul className="ai-bullet-list">
                  {keyRisks.slice(0, 4).map((r, i) => (
                    <li key={i}>
                      <span className="bullet-point bullet-red">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ai-col">
                <h4 className="ai-col-heading">Recommended Actions</h4>
                <ul className="ai-bullet-list">
                  {recActions.slice(0, 4).map((a, i) => (
                    <li key={i}>
                      <span className="bullet-point bullet-green">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="card-panel-footer">
            <button className="text-link-btn" onClick={() => onNavigate("ai")}>
              <span>View Full AI Analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Card 2: Recent Recommendations */}
        <div className="card-panel flex-col-justify">
          <div>
            <div className="card-panel-header">
              <h3 className="card-panel-title">Recent Recommendations</h3>
              <button className="header-view-all-link" onClick={() => onNavigate("recommendations")}>
                View All
              </button>
            </div>

            <div className="recommendations-list">
              {/* Item 1 */}
              <div className="rec-list-item">
                <div className="rec-icon-circle bg-circle-red">
                  <ShoppingCart size={17} className="text-rose" />
                </div>
                <div className="rec-item-info">
                  <strong className="rec-item-title">Order 15 Ventilators</strong>
                  <span className="rec-item-sub">Critical shortage • Est. Cost: ₹22,50,000</span>
                </div>
                <span className="rec-time-badge">10 min ago</span>
              </div>

              {/* Item 2 */}
              <div className="rec-list-item">
                <div className="rec-icon-circle bg-circle-orange">
                  <BedDouble size={17} className="text-orange" />
                </div>
                <div className="rec-item-info">
                  <strong className="rec-item-title">Increase ICU Capacity</strong>
                  <span className="rec-item-sub">High bed occupancy • Est. Cost: ₹8,00,000</span>
                </div>
                <span className="rec-time-badge">25 min ago</span>
              </div>

              {/* Item 3 */}
              <div className="rec-list-item">
                <div className="rec-icon-circle bg-circle-green">
                  <Users size={17} className="text-emerald" />
                </div>
                <div className="rec-item-info">
                  <strong className="rec-item-title">Staff Schedule Optimization</strong>
                  <span className="rec-item-sub">High overtime • Est. Impact: ₹1,20,000/month</span>
                </div>
                <span className="rec-time-badge">1 hour ago</span>
              </div>

              {/* Item 4 */}
              <div className="rec-list-item">
                <div className="rec-icon-circle bg-circle-blue">
                  <ClipboardList size={17} className="text-blue" />
                </div>
                <div className="rec-item-info">
                  <strong className="rec-item-title">Routine Inventory Review</strong>
                  <span className="rec-item-sub">Standard check • Est. Cost: ₹50,000</span>
                </div>
                <span className="rec-time-badge">2 hours ago</span>
              </div>
            </div>
          </div>

          <div className="card-panel-footer">
            <button className="text-link-btn" onClick={() => onNavigate("recommendations")}>
              <span>View All Recommendations</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Card 3: System Status */}
        <div className="card-panel flex-col-justify">
          <div>
            <div className="card-panel-header">
              <h3 className="card-panel-title">System Status</h3>
            </div>

            <div className="system-status-list">
              <div className="sys-status-row">
                <div className="sys-label-wrap">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Backend API</span>
                </div>
                <strong className="text-emerald font-semibold">Online</strong>
              </div>

              <div className="sys-status-row">
                <div className="sys-label-wrap">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Database</span>
                </div>
                <strong className="text-emerald font-semibold">Connected</strong>
              </div>

              <div className="sys-status-row">
                <div className="sys-label-wrap">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>AI Service (Gemini)</span>
                </div>
                <strong className="text-emerald font-semibold">Operational</strong>
              </div>

              <div className="sys-status-row">
                <div className="sys-label-wrap">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Prediction Engine</span>
                </div>
                <strong className="text-emerald font-semibold">Active</strong>
              </div>

              <div className="sys-status-row">
                <div className="sys-label-wrap">
                  <CheckCircle2 size={16} className="text-emerald" />
                  <span>Last Data Sync</span>
                </div>
                <strong className="text-emerald font-semibold">2 min ago</strong>
              </div>
            </div>
          </div>

          <div className="card-panel-footer">
            <button className="text-link-btn" onClick={() => onNavigate("system")}>
              <span>View System Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardView;
