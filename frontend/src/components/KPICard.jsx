import React from "react";

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "normal", // normal, critical, high, medium, success, info
  trend,
  onClick,
}) {
  return (
    <div className={`kpi-card kpi-variant-${variant} ${onClick ? "clickable" : ""}`} onClick={onClick}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        {Icon && (
          <div className="kpi-icon-wrap">
            <Icon size={20} className="kpi-icon" />
          </div>
        )}
      </div>

      <div className="kpi-body">
        <strong className="kpi-value">{value ?? "—"}</strong>
        {trend && (
          <span className={`kpi-trend ${trend.positive ? "trend-up" : "trend-down"}`}>
            {trend.text}
          </span>
        )}
      </div>

      {subtitle && <span className="kpi-subtitle">{subtitle}</span>}
    </div>
  );
}

export default KPICard;
