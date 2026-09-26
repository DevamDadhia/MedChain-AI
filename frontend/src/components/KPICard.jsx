import React from "react";
import { Info } from "lucide-react";

/**
 * Reusable Sparkline component with smooth Bezier curve and gradient fill
 */
export function Sparkline({
  variant = "green",
  width = 96,
  height = 32,
  customPath = null,
  customFill = null,
}) {
  const configs = {
    green: {
      color: "#10b981",
      path: "M 2 24 C 18 27, 32 14, 48 18 C 64 22, 78 8, 98 12",
      fill: "M 2 24 C 18 27, 32 14, 48 18 C 64 22, 78 8, 98 12 L 98 32 L 2 32 Z",
    },
    red: {
      color: "#ef4444",
      path: "M 2 26 C 20 26, 36 21, 52 24 C 68 28, 80 6, 98 10",
      fill: "M 2 26 C 20 26, 36 21, 52 24 C 68 28, 80 6, 98 10 L 98 32 L 2 32 Z",
    },
    orange: {
      color: "#f59e0b",
      path: "M 2 26 C 18 26, 36 18, 54 22 C 70 26, 82 12, 98 14",
      fill: "M 2 26 C 18 26, 36 18, 54 22 C 70 26, 82 12, 98 14 L 98 32 L 2 32 Z",
    },
    blue: {
      color: "#3b82f6",
      path: "M 2 24 C 20 25, 42 16, 60 22 C 76 28, 84 14, 98 10",
      fill: "M 2 24 C 20 25, 42 16, 60 22 C 76 28, 84 14, 98 10 L 98 32 L 2 32 Z",
    },
    purple: {
      color: "#8b5cf6",
      path: "M 2 22 C 22 26, 44 14, 62 20 C 78 26, 88 12, 98 14",
      fill: "M 2 22 C 22 26, 44 14, 62 20 C 78 26, 88 12, 98 14 L 98 32 L 2 32 Z",
    },
  };

  const c = configs[variant] || configs.green;
  const strokePath = customPath || c.path;
  const fillPath = customFill || c.fill;
  const gradId = `spark-grad-${variant}-${Math.random().toString(36).substring(2, 7)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 32"
      className="kpi-sparkline-svg"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c.color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${gradId})`} />
      <path
        d={strokePath}
        fill="none"
        stroke={c.color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Custom 3D Isometric Cube cluster icon for Total Inventory Items
 */
export function IsometricBoxesIcon({ size = 24, color = "#059669" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top isometric cube */}
      <path d="M12 2.5L16.5 5.1L12 7.7L7.5 5.1L12 2.5Z" />
      <path d="M7.5 5.1V9.5L12 12.1V7.7" />
      <path d="M16.5 5.1V9.5L12 12.1" />

      {/* Bottom left cube */}
      <path d="M7.5 10.5L12 13.1L7.5 15.7L3 13.1L7.5 10.5Z" />
      <path d="M3 13.1V17.5L7.5 20.1V15.7" />
      <path d="M12 13.1V17.5L7.5 20.1" />

      {/* Bottom right cube */}
      <path d="M16.5 10.5L21 13.1L16.5 15.7L12 13.1L16.5 10.5Z" />
      <path d="M12 13.1V17.5L16.5 20.1V15.7" />
      <path d="M21 13.1V17.5L16.5 20.1" />
    </svg>
  );
}

/**
 * Modern KPI Card matching the healthcare operations platform design
 */
export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "green", // "green" | "red" | "orange" | "blue" | "purple" | "normal" | "critical" etc.
  trend = null, // { value: "+12%", direction: "up" | "down", label: "vs last week", color: "green" | "red" }
  sparklineVariant = null, // "green" | "red" | "orange" | "blue" | "purple"
  showInfo = false,
  isStatusText = false,
  onClick,
}) {
  const variantMap = {
    normal: "blue",
    success: "green",
    critical: "red",
    danger: "red",
    high: "orange",
    warning: "orange",
    medium: "orange",
    info: "blue",
    purple: "purple",
    blue: "blue",
    green: "green",
    red: "red",
    orange: "orange",
  };
  const activeVariant = variantMap[variant] || "green";

  return (
    <div
      className={`kpi-card-box kpi-variant-${activeVariant} ${onClick ? "clickable" : ""}`}
      onClick={onClick}
    >
      {/* Top Section: Icon badge & Info/Header */}
      <div className="kpi-card-header">
        <div className={`kpi-badge kpi-badge-${activeVariant}`}>
          {Icon && <Icon size={22} className={`kpi-icon-${activeVariant}`} />}
        </div>

        {showInfo && (
          <button
            className="kpi-info-trigger"
            title="Card information"
            aria-label="Information"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Info size={15} />
          </button>
        )}
      </div>

      {/* Middle Section: Title, Value, Subtitle */}
      <div className="kpi-card-body">
        <span className="kpi-card-title">{title}</span>
        <div className={isStatusText ? "kpi-card-status-val" : "kpi-card-val"}>
          {value ?? "—"}
        </div>
        {subtitle && <span className="kpi-card-subtitle">{subtitle}</span>}
      </div>

      {/* Bottom Section: Trend Metric & Sparkline Chart */}
      {(trend || sparklineVariant) && (
        <div className="kpi-card-footer">
          {trend ? (
            <div className="kpi-trend-container">
              <span
                className={`kpi-trend-badge trend-text-${
                  trend.color || (trend.direction === "up" ? "green" : "red")
                }`}
              >
                {trend.direction === "up"
                  ? "↗ "
                  : trend.direction === "arrow-up"
                  ? "↑ "
                  : "↓ "}
                {trend.value || trend.text}
              </span>
              <span className="kpi-trend-label">
                {trend.label || "vs last week"}
              </span>
            </div>
          ) : (
            <div className="kpi-trend-spacer" />
          )}

          {sparklineVariant && (
            <div className="kpi-sparkline-container">
              <Sparkline variant={sparklineVariant} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default KPICard;
