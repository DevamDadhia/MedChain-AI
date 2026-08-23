import React from "react";
import {
  Activity,
  Boxes,
  BrainCircuit,
  Cpu,
  Layers,
  Users,
  BedDouble,
  UserPlus,
  Truck,
  DollarSign,
  LineChart,
  Server,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Executive Dashboard", icon: Activity },
  { id: "inventory", label: "Inventory Intelligence", icon: Boxes },
  { id: "predictions", label: "ML Predictions", icon: Cpu },
  { id: "ai", label: "AI Intelligence", icon: Sparkles },
  { id: "recommendations", label: "Recommendations", icon: BrainCircuit },
  { id: "bed", label: "Bed & Capacity", icon: BedDouble },
  { id: "staff", label: "Staff Workload", icon: Users },
  { id: "patients", label: "Patients", icon: UserPlus },
  { id: "vendors", label: "Vendors", icon: Truck },
  { id: "financial", label: "Financials", icon: DollarSign },
  { id: "analytics", label: "Analytics", icon: LineChart },
  { id: "system", label: "System Health", icon: Server },
];

export function Header({
  activeTab,
  onSelectTab,
  systemHealthy = true,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
}) {
  return (
    <header className="site-header">
      {/* Top bar with Branding and Live System Pulse */}
      <div className="header-top">
        <div className="header-brand">
          <div className="brand-badge">
            <Activity className="brand-logo-icon" size={24} />
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1 className="brand-title">HEALTHGRID</h1>
              <span className="brand-tag">ENTERPRISE ML & AI</span>
            </div>
            <p className="brand-subtitle">
              Healthcare Resource, Inventory, Demand Prediction & Decision Support Platform
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div className={`system-status-indicator ${systemHealthy ? "status-online" : "status-offline"}`}>
            <span className="pulse-dot"></span>
            <span className="status-label">{systemHealthy ? "FASTAPI BACKEND CONNECTED" : "BACKEND DISCONNECTED"}</span>
          </div>

          {lastUpdated && (
            <span className="last-updated-text">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}

          <button
            className={`refresh-btn ${isRefreshing ? "is-spinning" : ""}`}
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh live data from backend"
            aria-label="Refresh live data"
          >
            <RefreshCw size={15} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="header-nav" aria-label="Main Navigation">
        <div className="nav-scroll-container">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`nav-tab ${isActive ? "active" : ""}`}
                onClick={() => onSelectTab(item.id)}
                aria-selected={isActive}
                role="tab"
              >
                <Icon size={16} className="nav-tab-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export default Header;
