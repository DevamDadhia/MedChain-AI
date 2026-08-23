import React from "react";

export function LoadingSkeleton({ rows = 4, type = "card" }) {
  if (type === "table") {
    return (
      <div className="skeleton-table-wrap">
        <div className="skeleton skeleton-row skeleton-header-row" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton skeleton-row" />
        ))}
      </div>
    );
  }

  if (type === "card-grid") {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-container">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-block" />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
