import React, { useState } from "react";
import {
  AlertTriangle,
  Shield,
  BedDouble,
  Sparkles,
  BarChart2,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import KPICard, { IsometricBoxesIcon } from "../components/KPICard";
import DonutChart from "../components/DonutChart";
import TrendLineChart from "../components/TrendLineChart";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ErrorBanner from "../components/ErrorBanner";
import hospitalBannerImg from "../assets/hospital_banner.jpg";

/**
 * Mini sparkline wave for table rows
 */
function TableSparkline({ trend }) {
  const isUp = trend.startsWith("+");
  const color = isUp ? "#ef4444" : "#10b981";

  // Smooth wave path
  const path = isUp
    ? "M 2 13 C 12 15, 20 8, 28 11 C 36 14, 42 3, 48 5"
    : "M 2 4 C 12 2, 20 10, 28 7 C 36 5, 42 14, 48 13";

  return (
    <div className="table-spark-container">
      <svg
        width="46"
        height="18"
        viewBox="0 0 50 16"
        className="table-sparkline-svg"
      >
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className={`table-trend-badge ${
          isUp ? "trend-badge-red" : "trend-badge-green"
        }`}
      >
        {trend}
      </span>
    </div>
  );
}

/**
 * Robot Mascot for AI Executive Summary matching the screenshot
 */
function AIMascotIcon() {
  return (
    <div className="ai-mascot-wrapper">
      <svg
        width="76"
        height="76"
        viewBox="0 0 80 80"
        fill="none"
        className="ai-mascot-svg"
      >
        {/* Soft background glow */}
        <circle cx="40" cy="42" r="32" fill="#f3e8ff" opacity="0.6" />

        {/* Ambient sparkle stars */}
        <path
          d="M16 28L18 24L20 28L24 30L20 32L18 36L16 32L12 30L16 28Z"
          fill="#c084fc"
        />
        <path
          d="M64 24L65.5 20L67 24L71 25.5L67 27L65.5 31L64 27L60 25.5L64 24Z"
          fill="#c084fc"
        />
        <circle cx="21" cy="56" r="2.5" fill="#d8b4fe" />
        <circle cx="63" cy="52" r="2" fill="#d8b4fe" />

        {/* Robot head */}
        <rect x="22" y="24" width="36" height="32" rx="14" fill="#7c3aed" />

        {/* Antenna */}
        <line
          x1="40"
          y1="24"
          x2="40"
          y2="15"
          stroke="#7c3aed"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="40" cy="14" r="3.5" fill="#a855f7" />

        {/* Ears */}
        <rect x="18" y="34" width="4" height="12" rx="2" fill="#6d28d9" />
        <rect x="58" y="34" width="4" height="12" rx="2" fill="#6d28d9" />

        {/* Visor Screen */}
        <rect x="27" y="30" width="26" height="18" rx="8" fill="#1e1b4b" />

        {/* Glowing Eyes */}
        <circle cx="34" cy="39" r="3" fill="#67e8f9" />
        <circle cx="46" cy="39" r="3" fill="#67e8f9" />
      </svg>
    </div>
  );
}

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

  // Critical operational items matching the table in screenshot
  const criticalOperationalItems = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      status: "Stock: 120",
      riskLevel: "Critical",
      riskColor: "red",
      action: "Reorder Immediately",
      actionCritical: true,
      trend: "+15%",
    },
    {
      id: 2,
      name: "Surgical Gloves (M)",
      status: "Stock: 340",
      riskLevel: "High",
      riskColor: "orange",
      action: "Plan Procurement",
      actionCritical: false,
      trend: "+8%",
    },
    {
      id: 3,
      name: "N95 Masks",
      status: "Stock: 210",
      riskLevel: "High",
      riskColor: "orange",
      action: "Monitor Usage",
      actionCritical: false,
      trend: "-12%",
    },
    {
      id: 4,
      name: "Normal Saline 500ml",
      status: "Stock: 180",
      riskLevel: "High",
      riskColor: "orange",
      action: "Reorder Soon",
      actionCritical: false,
      trend: "+6%",
    },
    {
      id: 5,
      name: "Syringes 5ml",
      status: "Stock: 420",
      riskLevel: "Low",
      riskColor: "green",
      action: "No Action Required",
      actionCritical: false,
      trend: "-20%",
    },
  ];

  return (
    <div className="dashboard-content">
      {/* 1. HERO BANNER: Welcome Back + Hospital Graphic */}
      <section className="dashboard-hero-banner">
        <div className="hero-banner-left">
          <span className="hero-eyebrow">HOSPITAL OPERATIONS PLATFORM</span>
          <h1 className="hero-title">
            Welcome back, <span className="hero-admin-highlight">Admin</span>
          </h1>
          <p className="hero-description">
            Monitor resources, predict shortages and ensure better healthcare delivery.
          </p>
        </div>

        <div className="hero-banner-right">
          <div
            className="hero-hospital-card"
            style={{ backgroundImage: `url(${hospitalBannerImg})` }}
          >
            <div className="hero-hospital-pill">
              <span>Efficient Hospitals. Stronger Communities.</span>
              <div className="hero-hospital-arrow">
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UPPER BOXES: TOP 5 KPI CARDS ROW */}
      <section className="kpi-cards-grid">
        {/* Card 1: Total Inventory Items */}
        <KPICard
          title="Total Inventory Items"
          value={total.toLocaleString()}
          subtitle="Monitored Assets"
          icon={IsometricBoxesIcon}
          variant="green"
          trend={{
            value: "+12%",
            direction: "up",
            label: "vs last week",
            color: "green",
          }}
          sparklineVariant="green"
          onClick={() => onNavigate("inventory")}
        />

        {/* Card 2: Critical Items */}
        <KPICard
          title="Critical Items"
          value={critical.toLocaleString()}
          subtitle="Immediate Attention"
          icon={AlertTriangle}
          variant="red"
          trend={{
            value: "8%",
            direction: "arrow-up",
            label: "vs last week",
            color: "red",
          }}
          sparklineVariant="red"
          onClick={() => onNavigate("inventory")}
        />

        {/* Card 3: High-Risk Items */}
        <KPICard
          title="High-Risk Items"
          value={high.toLocaleString()}
          subtitle="Short lead-time buffer"
          icon={Shield}
          variant="orange"
          trend={{
            value: "5%",
            direction: "down",
            label: "vs last week",
            color: "green",
          }}
          sparklineVariant="orange"
          onClick={() => onNavigate("inventory")}
        />

        {/* Card 4: Bed Occupancy */}
        <KPICard
          title="Bed Occupancy"
          value={`${occupancyVal}%`}
          subtitle={`${bed.admissions ?? 27} Active Admissions`}
          icon={BedDouble}
          variant="blue"
          trend={{
            value: "3%",
            direction: "arrow-up",
            label: "vs last week",
            color: "red",
          }}
          sparklineVariant="blue"
          onClick={() => onNavigate("bed")}
        />

        {/* Card 5: AI Risk Priority */}
        <KPICard
          title="AI Risk Priority"
          value={ai.priority ? ai.priority : "Analysis unavailable"}
          subtitle={
            ai.priority
              ? "Overall Risk Level"
              : "AI service is currently unavailable"
          }
          icon={Sparkles}
          variant="purple"
          showInfo={true}
          isStatusText={!ai.priority}
          onClick={() => onNavigate("ai")}
        />
      </section>

      {/* 3. MIDDLE ROW: INVENTORY RISK OVERVIEW & BED OCCUPANCY TREND */}
      <section className="dashboard-grid-2">
        {/* Left: Inventory Risk Overview */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="card-header-left">
              <div className="card-header-icon-circle circle-green">
                <BarChart2 size={18} className="text-emerald" />
              </div>
              <div>
                <h3 className="analytics-card-title">Inventory Risk Overview</h3>
                <p className="analytics-card-sub">
                  Distribution of inventory items by risk level
                </p>
              </div>
            </div>

            <div className="dropdown-pill">
              <span>{categoryFilter}</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="inventory-donut-body">
            <DonutChart
              total={total}
              critical={critical}
              high={high}
              medium={medium}
              low={low}
              size={195}
              strokeWidth={24}
            />

            <div className="donut-legend-container">
              {/* Critical Risk */}
              <div className="donut-legend-item">
                <div className="legend-label-col">
                  <span className="legend-bullet bullet-red"></span>
                  <span className="legend-name">Critical Risk</span>
                </div>
                <div className="legend-value-col">
                  <span className="legend-number">{critical} ({critPct}%)</span>
                  <div className="legend-bar-track">
                    <div
                      className="legend-bar-fill fill-red"
                      style={{ width: `${Math.min(100, Math.max(15, Number(critPct) * 1.5))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* High Risk */}
              <div className="donut-legend-item">
                <div className="legend-label-col">
                  <span className="legend-bullet bullet-orange"></span>
                  <span className="legend-name">High Risk</span>
                </div>
                <div className="legend-value-col">
                  <span className="legend-number">{high} ({highPct}%)</span>
                  <div className="legend-bar-track">
                    <div
                      className="legend-bar-fill fill-orange"
                      style={{ width: `${Math.min(100, Math.max(15, Number(highPct) * 1.2))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Medium Risk */}
              <div className="donut-legend-item">
                <div className="legend-label-col">
                  <span className="legend-bullet bullet-yellow"></span>
                  <span className="legend-name">Medium Risk</span>
                </div>
                <div className="legend-value-col">
                  <span className="legend-number">{medium} ({medPct}%)</span>
                  <div className="legend-bar-track">
                    <div
                      className="legend-bar-fill fill-yellow"
                      style={{ width: `${Math.min(100, Math.max(15, Number(medPct) * 1.5))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Low Risk */}
              <div className="donut-legend-item">
                <div className="legend-label-col">
                  <span className="legend-bullet bullet-green"></span>
                  <span className="legend-name">Low Risk</span>
                </div>
                <div className="legend-value-col">
                  <span className="legend-number">{low} ({lowPct}%)</span>
                  <div className="legend-bar-track">
                    <div
                      className="legend-bar-fill fill-green"
                      style={{ width: `${Math.min(100, Math.max(15, Number(lowPct) * 1.4))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bed Occupancy Trend */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="card-header-left">
              <div className="card-header-icon-circle circle-green">
                <TrendingUp size={18} className="text-emerald" />
              </div>
              <div>
                <h3 className="analytics-card-title">Bed Occupancy Trend</h3>
                <p className="analytics-card-sub">
                  Daily bed occupancy rate over the last 7 days
                </p>
              </div>
            </div>

            <div className="dropdown-pill">
              <span>{timeRange}</span>
              <ChevronDown size={14} />
            </div>
          </div>

          <div className="chart-card-body">
            <TrendLineChart currentOccupancy={occupancyVal} />
          </div>
        </div>
      </section>

      {/* 4. BOTTOM ROW: CRITICAL OPERATIONAL RISKS & AI EXECUTIVE SUMMARY */}
      <section className="dashboard-grid-2">
        {/* Left: Critical Operational Risks */}
        <div className="analytics-card">
          <div className="analytics-card-header">
            <div className="card-header-left">
              <div className="card-header-icon-circle circle-red">
                <AlertTriangle size={18} className="text-rose" />
              </div>
              <div>
                <h3 className="analytics-card-title">
                  Critical Operational Risks
                </h3>
                <p className="analytics-card-sub">
                  Items requiring immediate attention
                </p>
              </div>
            </div>

            <button
              className="view-all-pill-btn"
              onClick={() => onNavigate("inventory")}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="table-responsive-clean">
            <table className="operations-table">
              <thead>
                <tr>
                  <th>Item / Resource</th>
                  <th>Current Status</th>
                  <th>Risk Level</th>
                  <th>Action Required</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {criticalOperationalItems.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="text-slate-500">{item.status}</td>
                    <td>
                      <div className="risk-level-cell">
                        <span
                          className={`risk-bullet bullet-${item.riskColor}`}
                        />
                        <span className="risk-level-text">
                          {item.riskLevel}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          item.actionCritical
                            ? "action-text-critical"
                            : "action-text-normal"
                        }
                      >
                        {item.action}
                      </span>
                    </td>
                    <td>
                      <TableSparkline trend={item.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: AI Executive Summary */}
        <div className="analytics-card flex-between">
          <div>
            <div className="analytics-card-header">
              <div className="card-header-left">
                <div className="card-header-icon-circle circle-purple">
                  <Sparkles size={18} className="text-purple" />
                </div>
                <div>
                  <h3 className="analytics-card-title">AI Executive Summary</h3>
                  <p className="analytics-card-sub">
                    AI-powered insights and risk analysis
                  </p>
                </div>
              </div>

              <button
                className="view-all-pill-btn"
                onClick={() => onNavigate("ai")}
              >
                <span>View Details</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* AI Offline / Unavailable State matching screenshot */}
            <div className="ai-empty-state">
              <AIMascotIcon />
              <h4 className="ai-empty-title">
                AI analysis is currently unavailable
              </h4>
              <p className="ai-empty-desc">
                The AI service is not responding at the moment. Please check the backend connection or API credentials.
              </p>
              <button
                className="ai-retry-pill-btn"
                onClick={onRefresh}
                title="Retry AI Analysis"
              >
                <RefreshCw size={14} />
                <span>Retry Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardView;
