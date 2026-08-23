import React, { useState, useEffect } from "react";
import { Calendar, Bell, RefreshCw } from "lucide-react";

export function TopNavbar({ systemHealthy = true, isRefreshing = false, onRefresh }) {
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      // Format as "22 Aug 2026, 07:28 PM"
      const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      setCurrentDateTime(`${dateStr}, ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <h1 className="welcome-title">Welcome back, Admin</h1>
        <p className="welcome-subtitle">Here's what's happening with your hospital today.</p>
      </div>

      <div className="top-navbar-right">
        {/* Backend Connected Pill */}
        <div className={`status-pill ${systemHealthy ? "status-pill-online" : "status-pill-offline"}`}>
          <span className="status-dot"></span>
          <span>{systemHealthy ? "Backend Connected" : "Backend Offline"}</span>
        </div>

        {/* Date & Time Widget */}
        <div className="date-time-widget">
          <Calendar size={16} className="widget-icon" />
          <span>{currentDateTime || "22 Aug 2026, 07:28 PM"}</span>
        </div>

        {/* Refresh Action */}
        <button
          className={`icon-action-btn ${isRefreshing ? "is-spinning" : ""}`}
          onClick={onRefresh}
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RefreshCw size={17} />
        </button>

        {/* Notifications Bell */}
        <button className="icon-action-btn notif-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notif-badge">3</span>
        </button>
      </div>
    </header>
  );
}

export default TopNavbar;
