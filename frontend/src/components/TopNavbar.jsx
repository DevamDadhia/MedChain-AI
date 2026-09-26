import React, { useState, useEffect } from "react";
import { Search, Calendar, Bell, RefreshCw } from "lucide-react";

export function TopNavbar({
  systemHealthy = true,
  isRefreshing = false,
  onRefresh,
}) {
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format as "26 Sept 2026, 07:51 PM"
      const day = now.getDate();
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"
      ];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? String(hours).padStart(2, "0") : "12";
      
      setCurrentDateTime(`${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-navbar">
      {/* Search Bar matching screenshot */}
      <div className="top-navbar-search">
        <Search size={17} className="search-icon" />
        <input
          type="text"
          placeholder="Search inventory, beds, staff, reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="search-shortcut">Ctrl + K</div>
      </div>

      {/* Right Controls */}
      <div className="top-navbar-right">
        {/* Backend Connected Pill */}
        <div
          className={`status-pill ${
            systemHealthy ? "status-pill-online" : "status-pill-offline"
          }`}
        >
          <span className="status-dot"></span>
          <span>{systemHealthy ? "Backend Connected" : "Backend Disconnected"}</span>
        </div>

        {/* Date & Time Widget */}
        <div className="date-time-widget">
          <Calendar size={15} className="widget-icon" />
          <span>{currentDateTime || "26 Sept 2026, 07:51 PM"}</span>
        </div>

        {/* Refresh Action */}
        <button
          className={`icon-circle-btn ${isRefreshing ? "is-spinning" : ""}`}
          onClick={onRefresh}
          title="Refresh Data"
          aria-label="Refresh Data"
        >
          <RefreshCw size={16} />
        </button>

        {/* Notifications Bell with count badge */}
        <button
          className="icon-circle-btn notif-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={17} />
          <span className="notif-badge">3</span>
        </button>
      </div>
    </header>
  );
}

export default TopNavbar;
