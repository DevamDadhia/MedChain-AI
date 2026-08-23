import React from "react";

export function DonutChart({
  total = 1000,
  critical = 86,
  high = 524,
  medium = 134,
  low = 256,
  size = 220,
  strokeWidth = 28,
}) {
  const sum = total || (critical + high + medium + low) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const data = [
    { key: "critical", value: critical, color: "#f43f5e" }, // Red
    { key: "high", value: high, color: "#f97316" },        // Orange
    { key: "medium", value: medium, color: "#eab308" },    // Yellow
    { key: "low", value: low, color: "#22c55e" },          // Green
  ];

  let accumulated = 0;
  const slices = data.map((item) => {
    const pct = item.value / sum;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -accumulated * circumference;
    accumulated += pct;
    return { ...item, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="donut-chart-container" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {slices.map((slice) => (
          <circle
            key={slice.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={slice.strokeDasharray}
            strokeDashoffset={slice.strokeDashoffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="donut-segment"
          />
        ))}
      </svg>

      <div className="donut-center-text">
        <strong className="donut-total">{total.toLocaleString()}</strong>
        <span className="donut-label">Total Items</span>
      </div>
    </div>
  );
}

export default DonutChart;
