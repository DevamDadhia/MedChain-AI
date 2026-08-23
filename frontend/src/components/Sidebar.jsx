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
  ChevronDown,
  Activity,
  PlusSquare,
} from "lucide-react";

export const SIDEBAR_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inventory", label: "Inventory", icon: Boxes, hasSubmenu: true },
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
        <div className="sidebar-logo-wrap">
          <div className="sidebar-logo-icon">
            <PlusSquare size={26} className="logo-cross" />
          </div>
        </div>
        <div className="sidebar-brand-text">
          <h2 className="sidebar-title">HEALTHGRID</h2>
          <span className="sidebar-subtitle">Hospital Operations Platform</span>
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
                  {item.hasSubmenu && (
                    <ChevronRight size={15} className="sidebar-chevron" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile-card">
          <div className="user-avatar">
            <span>AD</span>
          </div>
          <div className="user-info">
            <strong className="user-name">Admin User</strong>
            <span className="user-role">Super Administrator</span>
          </div>
          <ChevronDown size={16} className="user-chevron" />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
