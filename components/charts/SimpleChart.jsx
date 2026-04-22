"use client";

function formatShort(value) {
  if (Math.abs(value) >= 1e7) return `${(value / 1e7).toFixed(1)}Cr`;
  if (Math.abs(value) >= 1e5) return `${(value / 1e5).toFixed(1)}L`;
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`;
  return `${Math.round(value)}`;
}

export function SimpleChart({ type = "bar", labels, datasets }) {
  const flatValues = datasets.flatMap((dataset) => dataset.data);
  const maxValue = Math.max(...flatValues, 1);
  const points = labels.map((_, index) => index);
  const width = 520;
  const height = 220;
  const left = 32;
  const right = 12;
  const top = 12;
  const bottom = 32;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  const getX = (index) =>
    left + (points.length === 1 ? chartWidth / 2 : (index / (points.length - 1)) * chartWidth);

  const getY = (value) => top + chartHeight - (value / maxValue) * chartHeight;

  const tickValues = [0, maxValue / 2, maxValue];

  return (
    <div className="chart-card">
      <div className="chart-legend">
        {datasets.map((dataset) => (
          <span key={dataset.label} className="legend-item">
            <span className="legend-swatch" style={{ background: dataset.color }} />
            {dataset.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img">
        {tickValues.map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={width - right}
              y1={getY(tick)}
              y2={getY(tick)}
              className="chart-grid-line"
            />
            <text x={6} y={getY(tick) + 4} className="chart-axis-text">
              {formatShort(tick)}
            </text>
          </g>
        ))}

        {type === "bar" &&
          datasets.map((dataset, datasetIndex) =>
            dataset.data.map((value, index) => {
              const barGroupWidth = chartWidth / labels.length;
              const barWidth = Math.max((barGroupWidth - 12) / datasets.length, 10);
              const x = left + index * barGroupWidth + 6 + datasetIndex * barWidth;
              const y = getY(value);
              return (
                <rect
                  key={`${dataset.label}-${labels[index]}`}
                  x={x}
                  y={y}
                  width={barWidth - 2}
                  height={top + chartHeight - y}
                  rx="4"
                  fill={dataset.color}
                  opacity={dataset.opacity ?? 0.95}
                />
              );
            })
          )}

        {type === "line" &&
          datasets.map((dataset) => {
            const polyline = dataset.data
              .map((value, index) => `${getX(index)},${getY(value)}`)
              .join(" ");
            return (
              <g key={dataset.label}>
                <polyline
                  fill="none"
                  stroke={dataset.color}
                  strokeWidth="3"
                  strokeDasharray={dataset.dashed ? "6 6" : "0"}
                  points={polyline}
                />
                {dataset.data.map((value, index) => (
                  <circle
                    key={`${dataset.label}-${labels[index]}`}
                    cx={getX(index)}
                    cy={getY(value)}
                    r="3"
                    fill={dataset.color}
                  />
                ))}
              </g>
            );
          })}

        {labels.map((label, index) => (
          <text
            key={label}
            x={getX(index)}
            y={height - 8}
            textAnchor="middle"
            className="chart-axis-text"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}
