import React from "react";

export function TrendLineChart({
  currentOccupancy = 90.41,
  timeseriesData = [],
}) {
  // 7-day default points if timeseries has fewer points
  const defaultDays = [
    { label: "16 Aug", value: 72 },
    { label: "17 Aug", value: 84 },
    { label: "18 Aug", value: 85 },
    { label: "19 Aug", value: 78 },
    { label: "20 Aug", value: 81 },
    { label: "21 Aug", value: 87 },
    { label: "22 Aug", value: Number(currentOccupancy) || 90.41 },
  ];

  const points = timeseriesData.length >= 7
    ? timeseriesData.slice(-7).map((d, i) => ({
        label: d.timestamp ? d.timestamp.split(" ")[0].slice(5) : `Day ${i + 1}`,
        value: Number(d.bed_occupancy) || 75,
      }))
    : defaultDays;

  // Make sure the last point matches current live occupancy
  if (points.length > 0) {
    points[points.length - 1].value = Number(currentOccupancy) || 90.41;
  }

  const height = 180;
  const width = 500;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getY = (val) => paddingTop + chartHeight - (val / 100) * chartHeight;
  const getX = (index) => paddingLeft + (index / (points.length - 1)) * chartWidth;

  const coordinates = points.map((p, i) => ({
    x: getX(i),
    y: getY(p.value),
    ...p,
  }));

  const linePath = coordinates.reduce(
    (acc, curr, i) => `${acc} ${i === 0 ? "M" : "L"} ${curr.x} ${curr.y}`,
    ""
  );

  const lastPoint = coordinates[coordinates.length - 1];

  return (
    <div className="trend-line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg">
        {/* Horizontal Grid lines & Y-axis labels */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick} className="grid-tick">
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="tick-label">
                {tick}%
              </text>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
                strokeDasharray={tick === 0 ? "none" : "3 3"}
              />
            </g>
          );
        })}

        {/* The Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {coordinates.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={i === coordinates.length - 1 ? 5 : 4}
            fill="#16a34a"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}

        {/* Floating badge for latest current value */}
        {lastPoint && (
          <g transform={`translate(${lastPoint.x - 28}, ${lastPoint.y - 28})`}>
            <rect
              width="56"
              height="22"
              rx="4"
              fill="#16a34a"
            />
            <text
              x="28"
              y="15"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="700"
            >
              {lastPoint.value}%
            </text>
          </g>
        )}

        {/* X-axis date labels */}
        {coordinates.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={height - 6}
            textAnchor="middle"
            className="tick-label"
          >
            {pt.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default TrendLineChart;
