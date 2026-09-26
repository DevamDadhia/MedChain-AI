import React from "react";

export function TrendLineChart({
  currentOccupancy = 90.41,
  timeseriesData = [],
}) {
  // 7-day points matching the screenshot
  const defaultDays = [
    { label: "16 Aug", value: 74 },
    { label: "17 Aug", value: 87 },
    { label: "18 Aug", value: 88 },
    { label: "19 Aug", value: 80 },
    { label: "20 Aug", value: 83 },
    { label: "21 Aug", value: 89 },
    { label: "22 Aug", value: Number(currentOccupancy) || 90.41 },
  ];

  const pointsData =
    timeseriesData && timeseriesData.length >= 7
      ? timeseriesData.slice(-7).map((d, i) => ({
          label: d.timestamp ? d.timestamp.split(" ")[0].slice(5) : `Day ${i + 1}`,
          value: Number(d.bed_occupancy) || 75,
        }))
      : defaultDays;

  // Ensure last point reflects current occupancy
  if (pointsData.length > 0) {
    pointsData[pointsData.length - 1].value = Number(currentOccupancy) || 90.41;
  }

  const width = 560;
  const height = 210;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 32;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const chartBottom = height - paddingBottom;

  const getY = (val) => paddingTop + chartHeight - (val / 100) * chartHeight;
  const getX = (idx) => paddingLeft + (idx / (pointsData.length - 1)) * chartWidth;

  const coords = pointsData.map((p, i) => ({
    x: getX(i),
    y: getY(p.value),
    ...p,
  }));

  // Smooth Catmull-Rom to Cubic Bezier curve path
  const getSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const smoothCurve = getSmoothPath(coords);
  const lastPoint = coords[coords.length - 1];
  const areaFillPath = `${smoothCurve} L ${lastPoint.x} ${chartBottom} L ${coords[0].x} ${chartBottom} Z`;

  return (
    <div className="trend-line-chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="trend-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="occupancy-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines & Y ticks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = getY(tick);
          return (
            <g key={tick} className="grid-tick">
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                className="chart-tick-label"
              >
                {tick}%
              </text>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            </g>
          );
        })}

        {/* Translucent Area Gradient Fill */}
        <path d={areaFillPath} fill="url(#occupancy-area-grad)" />

        {/* Smooth Curved Line */}
        <path
          d={smoothCurve}
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {coords.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={i === coords.length - 1 ? 4.5 : 4}
            fill="#10b981"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}

        {/* Floating Tooltip Badge for Latest Point */}
        {lastPoint && (
          <g transform={`translate(${lastPoint.x - 28}, ${lastPoint.y - 32})`}>
            {/* Pill Background */}
            <rect
              width="56"
              height="22"
              rx="5"
              fill="#059669"
            />
            {/* Little Triangle Pointer pointing down */}
            <polygon
              points="24,22 32,22 28,26"
              fill="#059669"
            />
            <text
              x="28"
              y="15"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="11"
              fontWeight="700"
              fontFamily="var(--sans)"
            >
              {typeof lastPoint.value === "number" ? `${lastPoint.value}%` : lastPoint.value}
            </text>
          </g>
        )}

        {/* X-axis date labels */}
        {coords.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={height - 8}
            textAnchor="middle"
            className="chart-date-label"
          >
            {pt.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default TrendLineChart;
