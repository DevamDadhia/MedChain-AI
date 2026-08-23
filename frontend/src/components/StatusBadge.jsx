import React from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, ShieldAlert } from "lucide-react";

export function StatusBadge({ status, size = "md", icon = true }) {
  if (!status) return null;
  const s = String(status).toUpperCase();

  let type = "low";
  let IconComponent = Info;

  if (s === "CRITICAL" || s === "URGENT" || s === "ERROR" || s === "UNHEALTHY") {
    type = "critical";
    IconComponent = ShieldAlert;
  } else if (s === "HIGH" || s === "WARNING" || s === "DEGRADED") {
    type = "high";
    IconComponent = AlertTriangle;
  } else if (s === "MEDIUM" || s === "MODERATE" || s === "CONFIGURED") {
    type = "medium";
    IconComponent = AlertCircle;
  } else if (s === "LOW" || s === "ONLINE" || s === "HEALTHY" || s === "READY" || s === "SUCCESS") {
    type = "low";
    IconComponent = CheckCircle2;
  }

  return (
    <span className={`status-badge badge-${type} badge-${size}`} role="status" aria-label={`Status: ${s}`}>
      {icon && <IconComponent className="badge-icon" size={size === "sm" ? 12 : 14} />}
      <span className="badge-text">{s}</span>
    </span>
  );
}

export default StatusBadge;
