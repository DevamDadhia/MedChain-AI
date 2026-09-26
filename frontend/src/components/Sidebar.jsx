import React from "react";
import {
  LayoutDashboard,
  Boxes,
  Cpu,
  Sparkles,
  BrainCircuit,
  BedDouble,
  Users,
  LineChart,
  Server,
  Settings,
  ChevronRight,
  Plus,
  ArrowRight,
} from "lucide-react";
import sidebarPromoImg from "../assets/sidebar_promo.jpg";

export const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "predictions", label: "Predictions", icon: Cpu },
  { id: "ai", label: "AI Intelligence", icon: Sparkles },
  { id: "recommendations", label: "Recommendations", icon: BrainCircuit },
  { id: "bed", label: "Bed & Capacity", icon: BedDouble },
  { id: "staff", label: "Staff Management", icon: Users },
  { id: "analytics", label: "Reports", icon: LineChart },
  { id: "system", label: "System Status", icon: Server },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand" onClick={() => onSelectTab("dashboard")}>
        <div className="sidebar-brand-badge">
          <Plus size={22} strokeWidth={3.5} className="brand-cross-icon" />
        </div>
        <div className="sidebar-brand-text">
          <h2 className="sidebar-brand-title">HEALTHGRID</h2>
          <span className="sidebar-brand-sub">Hospital Operations Platform</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="sidebar-menu-item">
                <button
                  className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={19} className="sidebar-icon" />
                  <span className="sidebar-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar Mission / Promo Card */}
      <div className="sidebar-promo-container">
        <div
          className="sidebar-promo-card"
          style={{ backgroundImage: `url(${sidebarPromoImg})` }}
        >
          <div className="promo-overlay">
            <p className="promo-text">
              Better Resource Allocation for Healthier Communities
            </p>
            <div className="promo-arrow-circle">
              <ArrowRight size={14} className="promo-arrow-icon" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile-row">
          <div className="user-avatar-circle">
            <span>AD</span>
          </div>
          <div className="user-profile-details">
            <strong className="user-profile-name">Admin User</strong>
            <span className="user-profile-role">Super Administrator</span>
          </div>
          <ChevronRight size={17} className="user-chevron-icon" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
