import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";
import DashboardView from "./views/DashboardView";
import InventoryView from "./views/InventoryView";
import PredictionsView from "./views/PredictionsView";
import AIIntelligenceView from "./views/AIIntelligenceView";
import RecommendationsView from "./views/RecommendationsView";
import BedCapacityView from "./views/BedCapacityView";
import StaffView from "./views/StaffView";
import PatientsView from "./views/PatientsView";
import VendorsView from "./views/VendorsView";
import FinancialView from "./views/FinancialView";
import AnalyticsView from "./views/AnalyticsView";
import SystemView from "./views/SystemView";
import { getDashboard } from "./api/dashboard";
import { getHealth } from "./api/system";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [systemHealthy, setSystemHealthy] = useState(true);

  const fetchGlobalData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    setError(null);

    try {
      const [dashRes, healthRes] = await Promise.all([
        getDashboard(),
        getHealth().catch(() => ({ status: "unhealthy" })),
      ]);

      setDashboardData(dashRes);
      setSystemHealthy(healthRes?.status === "healthy");
    } catch (err) {
      console.error("Global fetch error:", err);
      setError(err.message || "Failed to connect to HEALTHGRID backend.");
      setSystemHealthy(false);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  const handleNavigate = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="layout-root">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} onSelectTab={handleNavigate} />

      {/* Main Workspace Area */}
      <div className="workspace">
        {/* Top Navbar */}
        <TopNavbar
          systemHealthy={systemHealthy}
          isRefreshing={isRefreshing}
          onRefresh={() => fetchGlobalData(true)}
        />

        {/* Dynamic View Content */}
        <main className="workspace-main">
          {activeTab === "dashboard" && (
            <DashboardView
              dashboard={dashboardData}
              loading={loading}
              error={error}
              onRefresh={() => fetchGlobalData(true)}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === "inventory" && <InventoryView />}
          {activeTab === "predictions" && <PredictionsView />}
          {activeTab === "ai" && <AIIntelligenceView />}
          {activeTab === "recommendations" && <RecommendationsView />}
          {activeTab === "bed" && <BedCapacityView />}
          {activeTab === "staff" && <StaffView />}
          {activeTab === "patients" && <PatientsView />}
          {activeTab === "vendors" && <VendorsView />}
          {activeTab === "financial" && <FinancialView />}
          {activeTab === "analytics" && <AnalyticsView />}
          {activeTab === "system" && <SystemView />}
          {activeTab === "settings" && <SystemView />}
        </main>

        {/* Footer */}
        <footer className="workspace-footer">
          <span>&copy; 2026 HealthGrid. All rights reserved.</span>
          <span>Version 1.0.0</span>
        </footer>
      </div>
    </div>
  );
}

export default App;